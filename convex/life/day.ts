import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { firstWeekEndCondition, universityFirstWeek } from './firstWeek';
import {
  evaluateFirstWeekReadiness,
  markFirstWeekDayCompleted,
  recordFirstWeekOrdinaryActivity,
} from './firstWeekProgress';
import { campusActivityRules, getCampusActivity } from './activities';
import { writeTelemetryForProfile } from '../research/telemetry';

const activityDayKey = (profile: any) =>
  `${profile.chapterId}:${profile.chapterUnit}:${profile.totalGameDays}`;

export const getFirstWeekStatus = query({
  args: {
    profileId: v.id('lifeProfiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.chapterId !== 'university_first_week') return null;

    const progress = await evaluateFirstWeekReadiness(ctx, args.profileId);
    return {
      currentDay: profile.chapterUnit,
      requiredPlayableDays: firstWeekEndCondition.requiredPlayableDays,
      minimumCoreEvents: firstWeekEndCondition.minimumCoreEvents,
      minimumDistinctNpcInteractions: firstWeekEndCondition.minimumDistinctNpcInteractions,
      requireOrdinaryLifeCompletion: firstWeekEndCondition.requireOrdinaryLifeCompletion,
      ...progress,
    };
  },
});

export const performCampusActivity = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    activityId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    const activity = getCampusActivity(args.activityId);
    if (!activity) throw new Error(`Unknown campus activity: ${args.activityId}`);

    const runtime = await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', args.profileId))
      .first();

    if (!runtime || runtime.activeLocationId !== activity.locationId) {
      return {
        performed: false,
        reason: 'wrong_location' as const,
        message: '先走到这个活动所在的区域，再开始做这件事。',
      };
    }
    if (runtime.activeScenarioId) {
      return {
        performed: false,
        reason: 'active_scenario' as const,
        message: '先把当前生活事件处理完，再安排自由活动。',
      };
    }

    const previousState = profile.state && typeof profile.state === 'object' ? profile.state : {};
    const dayKey = activityDayKey(profile);
    const existingDaily =
      previousState.campusActivities?.dayKey === dayKey
        ? previousState.campusActivities
        : undefined;
    const completedIds: string[] = Array.isArray(existingDaily?.completedIds)
      ? existingDaily.completedIds
      : [];

    if (!campusActivityRules.repeatSameActivityPerDay && completedIds.includes(activity.id)) {
      return {
        performed: false,
        reason: 'already_completed' as const,
        message: '这件事今天已经做过了。换个地方或换件小事试试。',
      };
    }
    if (completedIds.length >= campusActivityRules.maxDistinctActivitiesPerDay) {
      return {
        performed: false,
        reason: 'daily_limit' as const,
        message: '今天的自由活动已经很充实了。可以找人聊天、处理事件，或者结束今天。',
      };
    }

    const now = Date.now();
    const nextCompletedIds = [...completedIds, activity.id];
    await ctx.db.patch(args.profileId, {
      state: {
        ...previousState,
        campusActivities: {
          dayKey,
          completedIds: nextCompletedIds,
          lastActivityId: activity.id,
          lastActivityAt: now,
        },
      },
      updatedAt: now,
    });

    await ctx.db.insert('lifeEvents', {
      profileId: args.profileId,
      timestamp: now,
      gameDay: profile.totalGameDays,
      age: profile.age,
      chapterId: profile.chapterId,
      category: 'daily_life',
      eventKey: `campus_activity:${activity.id}`,
      title: activity.title,
      turningPoint: 'none',
      payload: {
        activityId: activity.id,
        locationId: activity.locationId,
        estimatedMinutes: activity.estimatedMinutes,
        tags: activity.tags,
      },
    });

    if (campusActivityRules.countsAsOrdinaryLifeExperience) {
      await recordFirstWeekOrdinaryActivity(ctx, args.profileId, activity.id);
    }

    await writeTelemetryForProfile(ctx, args.profileId, {
      eventType: 'interaction',
      action: 'campus_activity',
      locationId: activity.locationId,
      payload: {
        activityId: activity.id,
        estimatedMinutes: activity.estimatedMinutes,
      },
    });

    const readiness =
      profile.chapterId === 'university_first_week'
        ? await evaluateFirstWeekReadiness(ctx, args.profileId)
        : null;

    return {
      performed: true,
      reason: 'completed' as const,
      message: activity.completionText,
      activityId: activity.id,
      completedToday: nextCompletedIds.length,
      dailyLimit: campusActivityRules.maxDistinctActivitiesPerDay,
      readiness,
    };
  },
});

export const endFirstWeekDay = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');
    if (profile.chapterId !== 'university_first_week') {
      throw new Error('endFirstWeekDay is only available during the seven-day first chapter.');
    }
    if (profile.chapterUnit < 1 || profile.chapterUnit > 7) {
      throw new Error(`Invalid first-week day: ${profile.chapterUnit}`);
    }

    const completedDay = profile.chapterUnit;
    const dayDefinition = universityFirstWeek[completedDay - 1];
    const isFinalDay = completedDay >= firstWeekEndCondition.requiredPlayableDays;

    // Day 7 is a real chapter gate, not a cosmetic button. The current day is
    // counted prospectively, but it is only persisted as completed if every
    // gameplay requirement is satisfied.
    if (isFinalDay) {
      const readiness = await evaluateFirstWeekReadiness(ctx, args.profileId, completedDay);
      if (!readiness.ready) {
        return {
          advanced: false,
          completedDay,
          dayTitle: dayDefinition.title,
          closingBeat: '第一周还没有结束。再在校园里生活一会儿，把缺少的经历补齐。',
          firstWeekCompleted: false,
          nextChapterId: profile.chapterId,
          nextChapterUnit: profile.chapterUnit,
          totalGameDays: profile.totalGameDays,
          readiness,
        };
      }
    }

    const now = Date.now();
    const firstWeekCompleted = isFinalDay;
    const nextChapterId = firstWeekCompleted
      ? firstWeekEndCondition.nextChapterId
      : profile.chapterId;
    const nextChapterUnit = firstWeekCompleted ? 1 : completedDay + 1;
    const nextTotalGameDays = profile.totalGameDays + 1;

    // Close the active life event before rolling into the next day. Story-state
    // closure is allowed in normal play; fine-grained research telemetry remains
    // separately consent-gated.
    const runtime = await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', args.profileId))
      .first();
    if (runtime?.activeRunId) {
      await ctx.db.patch(runtime.activeRunId, {
        endedAt: now,
        outcome: 'day_ended',
      });
      await writeTelemetryForProfile(ctx, args.profileId, {
        eventType: 'scene_exit',
        action: 'day_ended',
        sceneId: runtime.activeScenarioId,
        locationId: runtime.activeLocationId,
      });
    }
    if (runtime) {
      await ctx.db.patch(runtime._id, {
        activeLocationId: undefined,
        activeScenarioId: undefined,
        activeRunId: undefined,
        locationEnteredAt: undefined,
        updatedAt: now,
      });
    }

    await markFirstWeekDayCompleted(ctx, args.profileId, completedDay);

    const previousState =
      profile.state && typeof profile.state === 'object' ? profile.state : {};
    const nextState = {
      ...previousState,
      chapterId: nextChapterId,
      chapterUnit: nextChapterUnit,
      totalGameDays: nextTotalGameDays,
    };

    await ctx.db.patch(args.profileId, {
      chapterId: nextChapterId,
      chapterUnit: nextChapterUnit,
      totalGameDays: nextTotalGameDays,
      state: nextState,
      updatedAt: now,
    });

    await ctx.db.insert('lifeEvents', {
      profileId: args.profileId,
      timestamp: now,
      gameDay: completedDay,
      age: profile.age,
      chapterId: profile.chapterId,
      category: 'education',
      eventKey: `first_week_day_${completedDay}_completed`,
      title: `${dayDefinition.title} · 日结`,
      turningPoint: firstWeekCompleted ? 'transition' : 'none',
      payload: {
        day: completedDay,
        closingBeat: dayDefinition.closingBeat,
        firstWeekCompleted,
        nextChapterId,
      },
    });

    if (firstWeekCompleted) {
      await ctx.db.insert('lifeEvents', {
        profileId: args.profileId,
        timestamp: now + 1,
        gameDay: completedDay,
        age: profile.age,
        chapterId: nextChapterId,
        category: 'education',
        eventKey: 'university_first_week_completed',
        title: '大学第一周结束',
        turningPoint: 'transition',
        payload: {
          fromChapterId: 'university_first_week',
          toChapterId: nextChapterId,
          requiredPlayableDays: firstWeekEndCondition.requiredPlayableDays,
          minimumCoreEvents: firstWeekEndCondition.minimumCoreEvents,
          minimumDistinctNpcInteractions: firstWeekEndCondition.minimumDistinctNpcInteractions,
          requireOrdinaryLifeCompletion: firstWeekEndCondition.requireOrdinaryLifeCompletion,
        },
      });
    }

    await writeTelemetryForProfile(ctx, args.profileId, {
      eventType: 'system',
      action: firstWeekCompleted ? 'first_week_completed' : 'first_week_day_completed',
      gameDay: completedDay,
      payload: { nextChapterId, nextChapterUnit },
    });

    const readiness = await evaluateFirstWeekReadiness(ctx, args.profileId);
    return {
      advanced: true,
      completedDay,
      dayTitle: dayDefinition.title,
      closingBeat: dayDefinition.closingBeat,
      firstWeekCompleted,
      nextChapterId,
      nextChapterUnit,
      totalGameDays: nextTotalGameDays,
      readiness,
    };
  },
});