import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import {
  caregiverRelationshipFromOrigin,
  ecologyFromOrigin,
  familySystemFromOrigin,
  generateLifeOrigin,
} from './origin';
import { createP003LifeProfileSnapshot } from './p003Model';
import { advanceP003ChapterClock } from './p003Transitions';
import type { LifeProfileSnapshot } from './types';

const asSnapshot = (profile: {
  state?: unknown;
  universityProfileId: string;
  age: number;
  season: string;
  lifeStage: string;
  chapterId: string;
  chapterUnit: number;
  totalGameDays: number;
  academicYear: string;
  careerStage: string;
}) =>
  ({
    ...(typeof profile.state === 'object' && profile.state ? profile.state : {}),
    universityProfileId: profile.universityProfileId,
    age: profile.age,
    season: profile.season,
    lifeStage: profile.lifeStage,
    chapterId: profile.chapterId,
    chapterUnit: profile.chapterUnit,
    totalGameDays: profile.totalGameDays,
    academicYear: profile.academicYear,
    careerStage: profile.careerStage,
  }) as LifeProfileSnapshot;

export const createP003LifeProfile = mutation({
  args: {
    profileKey: v.string(),
    worldId: v.optional(v.id('worlds')),
    sessionId: v.optional(v.id('researchSessions')),
    seed: v.optional(v.string()),
    birthYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('lifeProfiles')
      .withIndex('byProfileKey', (q) => q.eq('profileKey', args.profileKey))
      .first();

    if (existing) {
      return {
        profileId: existing._id,
        created: false,
        origin:
          typeof existing.state === 'object' && existing.state && 'origin' in existing.state
            ? existing.state.origin
            : undefined,
      };
    }

    const origin = generateLifeOrigin(
      args.seed ?? `p003:${args.profileKey}`,
      args.birthYear ?? 2000,
    );
    const state = createP003LifeProfileSnapshot(origin);
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
      snapshot: familySystemFromOrigin(origin),
      updatedAt: now,
    });

    const caregiver = caregiverRelationshipFromOrigin(origin);
    await ctx.db.insert('relationshipStates', {
      profileId,
      personKey: caregiver.personKey,
      relationshipType: caregiver.relationshipType,
      snapshot: caregiver,
      updatedAt: now,
    });

    for (const context of ecologyFromOrigin(origin)) {
      await ctx.db.insert('ecologicalContextStates', {
        profileId,
        system: context.system,
        contextKey: context.key,
        snapshot: context,
        updatedAt: now,
      });
    }

    await ctx.db.insert('lifeEvents', {
      profileId,
      timestamp: now,
      gameDay: 0,
      age: 0,
      chapterId: 'birth_and_family',
      category: 'birth',
      eventKey: 'p003_birth',
      title: '出生',
      turningPoint: 'transition',
      payload: {
        origin,
        principle: 'background_changes_opportunities_not_destiny',
      },
    });

    return { profileId, created: true, origin };
  },
});

export const advanceP003LifeUnit = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    statePatch: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    const current = asSnapshot(profile);
    const advanced = advanceP003ChapterClock(current);
    const next = {
      ...advanced.next,
      ...(args.statePatch ?? {}),
    } as LifeProfileSnapshot;

    await ctx.db.patch(args.profileId, {
      universityProfileId: next.universityProfileId,
      age: next.age,
      season: next.season,
      lifeStage: next.lifeStage,
      chapterId: next.chapterId,
      chapterUnit: next.chapterUnit,
      totalGameDays: next.totalGameDays,
      academicYear: next.academicYear,
      careerStage: next.careerStage,
      state: next,
      updatedAt: Date.now(),
    });

    if (advanced.chapterEnded) {
      await ctx.db.insert('lifeEvents', {
        profileId: args.profileId,
        timestamp: Date.now(),
        gameDay: next.totalGameDays,
        age: next.age,
        chapterId: next.chapterId,
        category: 'milestone',
        eventKey: `chapter_transition:${advanced.previousChapterId}:${next.chapterId}`,
        title: `进入人生新阶段：${next.chapterId}`,
        turningPoint: 'transition',
        payload: {
          fromChapterId: advanced.previousChapterId,
          toChapterId: next.chapterId,
        },
      });
    }

    return {
      age: next.age,
      season: next.season,
      lifeStage: next.lifeStage,
      chapterId: next.chapterId,
      chapterUnit: next.chapterUnit,
      chapterEnded: advanced.chapterEnded,
    };
  },
});
