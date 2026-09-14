import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { playerId } from '../aiTown/ids';

export const scenarioTables = {
  scenarioRuntimeStates: defineTable({
    profileId: v.id('lifeProfiles'),
    worldId: v.optional(v.id('worlds')),
    activeLocationId: v.optional(v.string()),
    activeScenarioId: v.optional(v.string()),
    activeRunId: v.optional(v.id('scenarioRuns')),
    locationEnteredAt: v.optional(v.number()),
    enabledPackIds: v.array(v.string()),
    behavioralResearchConsent: v.boolean(),
    sensitiveResearchConsent: v.boolean(),
    recentScenarioIds: v.array(v.string()),
    completedScenarioIds: v.array(v.string()),
    selectionIndex: v.number(),
    seed: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('byProfile', ['profileId'])
    .index('byWorld', ['worldId']),

  scenarioRuns: defineTable({
    runtimeId: v.id('scenarioRuntimeStates'),
    profileId: v.id('lifeProfiles'),
    scenarioId: v.string(),
    locationId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    outcome: v.optional(v.string()),
    selectionIndex: v.number(),
    selectionReasons: v.optional(v.array(v.string())),
    candidateCount: v.optional(v.number()),
    npcAssignments: v.optional(
      v.array(
        v.object({
          playerId,
          role: v.string(),
        }),
      ),
    ),
    humanMessageCount: v.optional(v.number()),
    interactedNpcIds: v.optional(v.array(playerId)),
  })
    .index('byRuntimeTime', ['runtimeId', 'startedAt'])
    .index('byProfileScenario', ['profileId', 'scenarioId']),
};