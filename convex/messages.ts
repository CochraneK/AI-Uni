import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { insertInput } from './aiTown/insertInput';
import { conversationId, playerId } from './aiTown/ids';
import { recordFirstWeekNpcInteractionForHumanToken } from './life/firstWeekProgress';
import { recordScenarioDialogueProgress } from './scenarios/progress';
import { writeTelemetryForHumanToken } from './research/telemetry';
import {
  authorizeControlledPlayer,
  authorizeConversationMembership,
  localActorToken,
} from './aiTown/publicInputAuthorization';
import { DEFAULT_NAME } from './constants';

export const listMessages = query({
  args: {
    worldId: v.id('worlds'),
    conversationId,
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('conversationId', (q) => q.eq('worldId', args.worldId).eq('conversationId', args.conversationId))
      .collect();
    const out = [];
    for (const message of messages) {
      const playerDescription = await ctx.db
        .query('playerDescriptions')
        .withIndex('worldId', (q) => q.eq('worldId', args.worldId).eq('playerId', message.author))
        .first();
      if (!playerDescription) {
        throw new Error(`Invalid author ID: ${message.author}`);
      }
      out.push({ ...message, authorName: playerDescription.name });
    }
    return out;
  },
});

export const writeMessage = mutation({
  args: {
    worldId: v.id('worlds'),
    conversationId,
    messageUuid: v.string(),
    playerId,
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const world = await ctx.db.get(args.worldId);
    if (!world) {
      throw new Error(`Invalid world ID: ${args.worldId}`);
    }
    const identity = await ctx.auth.getUserIdentity();
    authorizeControlledPlayer({
      world,
      playerId: args.playerId,
      actorTokenIdentifier: localActorToken({
        identityTokenIdentifier: identity?.tokenIdentifier ?? null,
        fallbackTokenIdentifier: DEFAULT_NAME,
      }),
    });
    authorizeConversationMembership({
      world,
      playerId: args.playerId,
      conversationId: args.conversationId,
    });

    await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      author: args.playerId,
      messageUuid: args.messageUuid,
      text: args.text,
      worldId: args.worldId,
    });

    const author = world?.players.find((player) => player.id === args.playerId);
    if (author?.human) {
      const conversation = world?.conversations.find(
        (candidate) => candidate.id === args.conversationId,
      );
      const otherPlayerId = conversation?.participants.find(
        (participant) => participant.playerId !== args.playerId,
      )?.playerId;

      await recordFirstWeekNpcInteractionForHumanToken(ctx, author.human, otherPlayerId);
      await writeTelemetryForHumanToken(ctx, author.human, {
        eventType: 'dialogue',
        action: 'human_message_sent',
        npcId: otherPlayerId,
        payload: {
          conversationId: args.conversationId,
          characterCount: args.text.length,
          direction: 'human_to_npc',
        },
      });
      await recordScenarioDialogueProgress(ctx, author.human, otherPlayerId);
    }

    await insertInput(ctx, args.worldId, 'finishSendingMessage', {
      conversationId: args.conversationId,
      playerId: args.playerId,
      timestamp: Date.now(),
    });
  },
});
