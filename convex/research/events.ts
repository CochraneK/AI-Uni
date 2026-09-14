import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

export const startSession = mutation({
  args: {
    participantKey: v.string(),
    worldId: v.optional(v.id('worlds')),
    studyVersion: v.string(),
    consentVersion: v.string(),
    condition: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert('researchSessions', {
      participantKey: args.participantKey,
      worldId: args.worldId,
      startedAt: Date.now(),
      studyVersion: args.studyVersion,
      consentVersion: args.consentVersion,
      condition: args.condition,
    }),
});

export const endSession = mutation({
  args: { sessionId: v.id('researchSessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { endedAt: Date.now() });
  },
});

export const logEvent = mutation({
  args: {
    sessionId: v.id('researchSessions'),
    gameDay: v.optional(v.number()),
    sceneId: v.optional(v.string()),
    locationId: v.optional(v.string()),
    npcId: v.optional(v.string()),
    eventType: v.union(
      v.literal('movement'),
      v.literal('interaction'),
      v.literal('dialogue'),
      v.literal('decision'),
      v.literal('scene_enter'),
      v.literal('scene_exit'),
      v.literal('latency'),
      v.literal('system'),
    ),
    action: v.optional(v.string()),
    responseLatencyMs: v.optional(v.number()),
    payload: v.optional(v.any()),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert('telemetryEvents', {
      ...args,
      timestamp: Date.now(),
    }),
});

export const writeBehavioralFeature = mutation({
  args: {
    sessionId: v.id('researchSessions'),
    sceneId: v.optional(v.string()),
    featureKey: v.string(),
    value: v.number(),
    modelVersion: v.string(),
    source: v.union(v.literal('rule'), v.literal('llm_rubric'), v.literal('statistical_model')),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert('behavioralFeatures', {
      ...args,
      computedAt: Date.now(),
    }),
});

export const listSessionEvents = query({
  args: { sessionId: v.id('researchSessions') },
  handler: async (ctx, args) =>
    await ctx.db
      .query('telemetryEvents')
      .withIndex('bySessionTime', (q) => q.eq('sessionId', args.sessionId))
      .collect(),
});
