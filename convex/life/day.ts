import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { firstWeekEndCondition, universityFirstWeek } from './firstWeek';

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

    const now = Date.now();
    const completedDay = profile.chapterUnit;
    const dayDefinition = universityFirstWeek[completedDay - 1];
    const firstWeekCompleted = completedDay >= firstWeekEndCondition.requiredPlayableDays;
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
        },
      });
    }

    return {
      completedDay,
      dayTitle: dayDefinition.title,
      closingBeat: dayDefinition.closingBeat,
      firstWeekCompleted,
      nextChapterId,
      nextChapterUnit,
      totalGameDays: nextTotalGameDays,
    };
  },
});
