import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { firstWeekEndCondition, universityFirstWeek } from './firstWeek';
import {
  evaluateFirstWeekReadiness,
  markFirstWeekDayCompleted,
} from './firstWeekProgress';
import { writeTelemetryForProfile } from '../research/telemetry';

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