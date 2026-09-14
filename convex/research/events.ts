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

/**
 * High-level entry point for the eventual consent UI. Call this only after the
 * participant has explicitly accepted the named consent version.
 */
export const startConsentedStudySession = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    studyVersion: v.string(),
    consentVersion: v.string(),
    condition: v.optional(v.string()),
    sensitiveResearchConsent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    if (profile.sessionId) {
      const existing = await ctx.db.get(profile.sessionId);
      if (existing && !existing.endedAt) return existing._id;
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert('researchSessions', {
      participantKey: profile.profileKey,
      worldId: profile.worldId,
      startedAt: now,
      studyVersion: args.studyVersion,
      consentVersion: args.consentVersion,
      condition: args.condition,
    });

    await ctx.db.patch(args.profileId, {
      sessionId,
      updatedAt: now,
    });

    const runtime = await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', args.profileId))
      .first();
    if (runtime) {
      await ctx.db.patch(runtime._id, {
        behavioralResearchConsent: true,
        sensitiveResearchConsent: args.sensitiveResearchConsent ?? false,
        updatedAt: now,
      });
    }

    await ctx.db.insert('telemetryEvents', {
      sessionId,
      timestamp: now,
      gameDay: profile.totalGameDays,
      sceneId: runtime?.activeScenarioId,
      locationId: runtime?.activeLocationId,
      eventType: 'system',
      action: 'research_session_started',
      payload: {
        consentVersion: args.consentVersion,
        studyVersion: args.studyVersion,
        sensitiveResearchConsent: args.sensitiveResearchConsent ?? false,
      },
    });

    return sessionId;
  },
});

export const endSession = mutation({
  args: { sessionId: v.id('researchSessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { endedAt: Date.now() });
  },
});

export const endConsentedStudySession = mutation({
  args: { profileId: v.id('lifeProfiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');
    if (!profile.sessionId) return null;

    const now = Date.now();
    const session = await ctx.db.get(profile.sessionId);
    if (session && !session.endedAt) {
      await ctx.db.insert('telemetryEvents', {
        sessionId: profile.sessionId,
        timestamp: now,
        gameDay: profile.totalGameDays,
        eventType: 'system',
        action: 'research_session_ended',
      });
      await ctx.db.patch(profile.sessionId, { endedAt: now });
    }

    const runtime = await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', args.profileId))
      .first();
    if (runtime) {
      await ctx.db.patch(runtime._id, {
        behavioralResearchConsent: false,
        sensitiveResearchConsent: false,
        updatedAt: now,
      });
    }

    return profile.sessionId;
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
    constructId: v.optional(v.string()),
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

export const saveCalibrationMeasure = mutation({
  args: {
    sessionId: v.id('researchSessions'),
    instrument: v.string(),
    version: v.string(),
    language: v.optional(v.string()),
    purpose: v.optional(v.union(v.literal('calibration'), v.literal('criterion'), v.literal('research_only'))),
    rawData: v.any(),
    scoreData: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert('calibrationMeasures', {
      ...args,
      completedAt: Date.now(),
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
