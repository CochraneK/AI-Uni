import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const researchTables = {
  researchSessions: defineTable({
    participantKey: v.string(),
    worldId: v.optional(v.id('worlds')),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    studyVersion: v.string(),
    consentVersion: v.string(),
    condition: v.optional(v.string()),
  })
    .index('byParticipant', ['participantKey'])
    .index('byWorld', ['worldId']),

  telemetryEvents: defineTable({
    sessionId: v.id('researchSessions'),
    timestamp: v.number(),
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
  })
    .index('bySessionTime', ['sessionId', 'timestamp'])
    .index('byScene', ['sessionId', 'sceneId']),

  behavioralFeatures: defineTable({
    sessionId: v.id('researchSessions'),
    sceneId: v.optional(v.string()),
    featureKey: v.string(),
    constructId: v.optional(v.string()),
    value: v.number(),
    computedAt: v.number(),
    modelVersion: v.string(),
    source: v.union(v.literal('rule'), v.literal('llm_rubric'), v.literal('statistical_model')),
  })
    .index('bySession', ['sessionId'])
    .index('byFeature', ['featureKey'])
    .index('byConstruct', ['constructId']),

  calibrationMeasures: defineTable({
    sessionId: v.id('researchSessions'),
    instrument: v.string(),
    version: v.string(),
    language: v.optional(v.string()),
    purpose: v.optional(v.union(v.literal('calibration'), v.literal('criterion'), v.literal('research_only'))),
    completedAt: v.number(),
    rawData: v.any(),
    scoreData: v.optional(v.any()),
    metadata: v.optional(v.any()),
  }).index('bySessionInstrument', ['sessionId', 'instrument']),
};
