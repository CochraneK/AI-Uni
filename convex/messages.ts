import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { insertInput } from './aiTown/insertInput';
import { conversationId, playerId } from './aiTown/ids';
import { writeTelemetryForHumanToken } from './research/telemetry';

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
    await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      author: args.playerId,
      messageUuid: args.messageUuid,
      text: args.text,
      worldId: args.worldId,
    });

    const world = await ctx.db.get(args.worldId);
    const author = world?.players.find((player) => player.id === args.playerId);
    if (author?.human) {
      const conversation = world?.conversations.find(
        (candidate) => candidate.id === args.conversationId,
      );
      const otherPlayerId = conversation?.participants.find(
        (participant) => participant.playerId !== args.playerId,
      )?.playerId;
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
    }

    await insertInput(ctx, args.worldId, 'finishSendingMessage', {
      conversationId: args.conversationId,
      playerId: args.playerId,
      timestamp: Date.now(),
    });
  },
});