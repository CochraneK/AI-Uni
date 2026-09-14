import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const lifeTables = {
  lifeProfiles: defineTable({
    profileKey: v.string(),
    worldId: v.optional(v.id('worlds')),
    sessionId: v.optional(v.id('researchSessions')),
    age: v.number(),
    season: v.string(),
    lifeStage: v.string(),
    chapterId: v.string(),
    chapterUnit: v.number(),
    totalGameDays: v.number(),
    academicYear: v.string(),
    careerStage: v.string(),
    state: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('byProfileKey', ['profileKey'])
    .index('byWorld', ['worldId'])
    .index('bySession', ['sessionId']),

  familySystemStates: defineTable({
    profileId: v.id('lifeProfiles'),
    generation: v.number(),
    familyKey: v.string(),
    snapshot: v.any(),
    updatedAt: v.number(),
  }).index('byProfileGeneration', ['profileId', 'generation']),

  relationshipStates: defineTable({
    profileId: v.id('lifeProfiles'),
    personKey: v.string(),
    relationshipType: v.string(),
    snapshot: v.any(),
    updatedAt: v.number(),
  })
    .index('byProfilePerson', ['profileId', 'personKey'])
    .index('byProfileType', ['profileId', 'relationshipType']),

  ecologicalContextStates: defineTable({
    profileId: v.id('lifeProfiles'),
    system: v.string(),
    contextKey: v.string(),
    snapshot: v.any(),
    updatedAt: v.number(),
  }).index('byProfileContext', ['profileId', 'system', 'contextKey']),

  lifeEvents: defineTable({
    profileId: v.id('lifeProfiles'),
    timestamp: v.number(),
    gameDay: v.optional(v.number()),
    age: v.number(),
    chapterId: v.string(),
    category: v.string(),
    eventKey: v.string(),
    title: v.string(),
    turningPoint: v.string(),
    payload: v.optional(v.any()),
  })
    .index('byProfileTime', ['profileId', 'timestamp'])
    .index('byProfileChapter', ['profileId', 'chapterId'])
    .index('byProfileCategory', ['profileId', 'category']),

  developmentalTaskStates: defineTable({
    profileId: v.id('lifeProfiles'),
    taskId: v.string(),
    status: v.union(
      v.literal('not_active'),
      v.literal('active'),
      v.literal('settled_for_now'),
      v.literal('reopened'),
    ),
    evidenceCount: v.number(),
    notes: v.optional(v.any()),
    updatedAt: v.number(),
  }).index('byProfileTask', ['profileId', 'taskId']),
};
