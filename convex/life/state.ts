import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { getUniversityProfile } from '../campus/registry';
import { defaultFamilySystem, defaultLifeProfile } from './model';

const relationshipTypeValidator = v.union(
  v.literal('parent'),
  v.literal('sibling'),
  v.literal('roommate'),
  v.literal('friend'),
  v.literal('close_friend'),
  v.literal('romantic_partner'),
  v.literal('spouse'),
  v.literal('child'),
  v.literal('teacher'),
  v.literal('mentor'),
  v.literal('coworker'),
  v.literal('manager'),
  v.literal('community'),
);

const assertUniversityProfile = (profileId: string) => {
  if (!getUniversityProfile(profileId)) {
    throw new Error(`Unknown university profile: ${profileId}`);
  }
};

export const createLifeProfile = mutation({
  args: {
    profileKey: v.string(),
    worldId: v.optional(v.id('worlds')),
    sessionId: v.optional(v.id('researchSessions')),
    universityProfileId: v.optional(v.string()),
    initialState: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('lifeProfiles')
      .withIndex('byProfileKey', (q) => q.eq('profileKey', args.profileKey))
      .first();
    if (existing) return existing._id;

    const state = {
      ...defaultLifeProfile,
      ...(args.initialState ?? {}),
      ...(args.universityProfileId ? { universityProfileId: args.universityProfileId } : {}),
    };
    assertUniversityProfile(state.universityProfileId);

    const now = Date.now();
    const profileId = await ctx.db.insert('lifeProfiles', {
      profileKey: args.profileKey,
      worldId: args.worldId,
      sessionId: args.sessionId,
      universityProfileId: state.universityProfileId,
      age: state.age,
      season: state.season,
      lifeStage: state.lifeStage,
      chapterId: state.chapterId,
      chapterUnit: state.chapterUnit,
      totalGameDays: state.totalGameDays,
      academicYear: state.academicYear,
      careerStage: state.careerStage,
      state,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('familySystemStates', {
      profileId,
      generation: 0,
      familyKey: 'family_of_origin',
      snapshot: defaultFamilySystem,
      updatedAt: now,
    });

    return profileId;
  },
});

export const getLifeProfile = query({
  args: { profileKey: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query('lifeProfiles')
      .withIndex('byProfileKey', (q) => q.eq('profileKey', args.profileKey))
      .first(),
});

export const changeUniversityProfile = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    universityProfileId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertUniversityProfile(args.universityProfileId);
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    const previousUniversityProfileId = profile.universityProfileId;
    const state = {
      ...(typeof profile.state === 'object' && profile.state ? profile.state : {}),
      universityProfileId: args.universityProfileId,
    };

    await ctx.db.patch(args.profileId, {
      universityProfileId: args.universityProfileId,
      state,
      updatedAt: Date.now(),
    });

    await ctx.db.insert('lifeEvents', {
      profileId: args.profileId,
      timestamp: Date.now(),
      age: profile.age,
      chapterId: profile.chapterId,
      category: 'education',
      eventKey: 'university_profile_change',
      title: '大学环境发生变化',
      turningPoint: 'transition',
      payload: {
        from: previousUniversityProfileId,
        to: args.universityProfileId,
        reason: args.reason,
      },
    });

    return { previousUniversityProfileId, universityProfileId: args.universityProfileId };
  },
});

export const advanceLifeUnit = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    statePatch: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    let chapterId = profile.chapterId;
    let chapterUnit = profile.chapterUnit + 1;
    let totalGameDays = profile.totalGameDays + 1;

    // Chapter 1 is deliberately seven fully playable days. After Day 7 the game
    // moves into a more compressed freshman-year timeline.
    if (profile.chapterId === 'university_first_week' && chapterUnit > 7) {
      chapterId = 'freshman_year';
      chapterUnit = 1;
    }

    const patch = args.statePatch ?? {};
    const universityProfileId = patch.universityProfileId ?? profile.universityProfileId;
    assertUniversityProfile(universityProfileId);

    const nextState = {
      ...(typeof profile.state === 'object' && profile.state ? profile.state : {}),
      ...patch,
      universityProfileId,
      chapterId,
      chapterUnit,
      totalGameDays,
    };

    await ctx.db.patch(args.profileId, {
      universityProfileId,
      age: patch.age ?? profile.age,
      season: patch.season ?? profile.season,
      lifeStage: patch.lifeStage ?? profile.lifeStage,
      chapterId,
      chapterUnit,
      totalGameDays,
      academicYear: patch.academicYear ?? profile.academicYear,
      careerStage: patch.careerStage ?? profile.careerStage,
      state: nextState,
      updatedAt: Date.now(),
    });

    return { universityProfileId, chapterId, chapterUnit, totalGameDays };
  },
});

export const recordLifeEvent = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    eventKey: v.string(),
    title: v.string(),
    category: v.string(),
    turningPoint: v.string(),
    gameDay: v.optional(v.number()),
    payload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    return await ctx.db.insert('lifeEvents', {
      profileId: args.profileId,
      timestamp: Date.now(),
      gameDay: args.gameDay,
      age: profile.age,
      chapterId: profile.chapterId,
      category: args.category,
      eventKey: args.eventKey,
      title: args.title,
      turningPoint: args.turningPoint,
      payload: args.payload,
    });
  },
});

export const upsertRelationshipState = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    personKey: v.string(),
    relationshipType: relationshipTypeValidator,
    snapshot: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('relationshipStates')
      .withIndex('byProfilePerson', (q) => q.eq('profileId', args.profileId).eq('personKey', args.personKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        relationshipType: args.relationshipType,
        snapshot: args.snapshot,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('relationshipStates', {
      profileId: args.profileId,
      personKey: args.personKey,
      relationshipType: args.relationshipType,
      snapshot: args.snapshot,
      updatedAt: Date.now(),
    });
  },
});

export const upsertFamilySystemState = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    generation: v.number(),
    familyKey: v.string(),
    snapshot: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('familySystemStates')
      .withIndex('byProfileGeneration', (q) => q.eq('profileId', args.profileId).eq('generation', args.generation))
      .filter((q) => q.eq(q.field('familyKey'), args.familyKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { snapshot: args.snapshot, updatedAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert('familySystemStates', {
      profileId: args.profileId,
      generation: args.generation,
      familyKey: args.familyKey,
      snapshot: args.snapshot,
      updatedAt: Date.now(),
    });
  },
});

export const upsertEcologicalContext = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    system: v.string(),
    contextKey: v.string(),
    snapshot: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('ecologicalContextStates')
      .withIndex('byProfileContext', (q) =>
        q.eq('profileId', args.profileId).eq('system', args.system).eq('contextKey', args.contextKey),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { snapshot: args.snapshot, updatedAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert('ecologicalContextStates', {
      profileId: args.profileId,
      system: args.system,
      contextKey: args.contextKey,
      snapshot: args.snapshot,
      updatedAt: Date.now(),
    });
  },
});

export const setDevelopmentalTaskState = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('developmentalTaskStates')
      .withIndex('byProfileTask', (q) => q.eq('profileId', args.profileId).eq('taskId', args.taskId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        evidenceCount: args.evidenceCount,
        notes: args.notes,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('developmentalTaskStates', {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const listLifeEvents = query({
  args: { profileId: v.id('lifeProfiles') },
  handler: async (ctx, args) =>
    await ctx.db
      .query('lifeEvents')
      .withIndex('byProfileTime', (q) => q.eq('profileId', args.profileId))
      .collect(),
});
