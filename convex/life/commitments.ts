import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { materializedFirstWeekCommitments } from '../campus/commitments';
import { formatGameMinute, getDayClock, makeDayClockKey, spendMinutes } from './dayClock';
import { writeTelemetryForProfile } from '../research/telemetry';

export const EARLY_ARRIVAL_MINUTES = 15;

export type CommitmentTemporalState =
  | 'upcoming'
  | 'arrival_window'
  | 'late_window'
  | 'expired'
  | 'resolved';

export const commitmentTemporalState = (
  commitment: {
    status: string;
    startMinute: number;
    endMinute: number;
    graceMinutes: number;
  },
  gameMinute: number,
): CommitmentTemporalState => {
  if (commitment.status !== 'scheduled') return 'resolved';
  if (gameMinute < commitment.startMinute - EARLY_ARRIVAL_MINUTES) return 'upcoming';
  if (gameMinute <= commitment.startMinute + commitment.graceMinutes) return 'arrival_window';
  if (gameMinute < commitment.endMinute) return 'late_window';
  return 'expired';
};

const eventCategoryForKind = (kind: string) =>
  ['class', 'presentation', 'exam', 'registration', 'group_meeting'].includes(kind)
    ? 'education'
    : kind === 'work_shift' || kind === 'interview'
      ? 'career'
      : 'social';

const writeCommitmentLifeEvent = async (
  ctx: any,
  profile: any,
  commitment: any,
  status: string,
  now: number,
  extra: Record<string, unknown> = {},
) => {
  await ctx.db.insert('lifeEvents', {
    profileId: profile._id,
    timestamp: now,
    gameDay: profile.totalGameDays,
    age: profile.age,
    chapterId: profile.chapterId,
    category: eventCategoryForKind(commitment.kind),
    eventKey: `commitment:${commitment.commitmentKey}:${status}`,
    title: commitment.title,
    turningPoint: 'none',
    payload: {
      commitmentKey: commitment.commitmentKey,
      kind: commitment.kind,
      locationId: commitment.locationId,
      startMinute: commitment.startMinute,
      endMinute: commitment.endMinute,
      attendanceRequired: commitment.attendanceRequired,
      status,
      ...extra,
    },
  });
};

export const ensureFirstWeekCommitments = mutation({
  args: { profileId: v.id('lifeProfiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');
    if (profile.chapterId !== 'university_first_week') return { created: 0 };

    let created = 0;
    const now = Date.now();
    for (const template of materializedFirstWeekCommitments) {
      // Existing development saves should not acquire fabricated missed history.
      // Seed only the current and future first-week commitments.
      if (template.chapterUnit < profile.chapterUnit) continue;

      const existing = await ctx.db
        .query('scheduledCommitments')
        .withIndex('byProfileKey', (q) =>
          q.eq('profileId', args.profileId).eq('commitmentKey', template.key),
        )
        .first();
      if (existing) continue;

      await ctx.db.insert('scheduledCommitments', {
        profileId: args.profileId,
        commitmentKey: template.key,
        chapterId: template.chapterId,
        chapterUnit: template.chapterUnit,
        kind: template.kind,
        title: template.title,
        locationId: template.locationId,
        startMinute: template.startMinute,
        endMinute: template.endMinute,
        attendanceRequired: template.attendanceRequired,
        graceMinutes: template.graceMinutes,
        status: 'scheduled',
        metadata: { description: template.description },
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }

    return { created };
  },
});

export const listCurrentCommitments = query({
  args: { profileId: v.id('lifeProfiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return [];

    const commitments = await ctx.db
      .query('scheduledCommitments')
      .withIndex('byProfileChapterUnit', (q) =>
        q
          .eq('profileId', args.profileId)
          .eq('chapterId', profile.chapterId)
          .eq('chapterUnit', profile.chapterUnit),
      )
      .collect();

    const state = profile.state && typeof profile.state === 'object' ? profile.state : {};
    const clock = getDayClock(state, makeDayClockKey(profile));

    return commitments
      .sort((a, b) => a.startMinute - b.startMinute)
      .map((commitment) => ({
        ...commitment,
        temporalState: commitmentTemporalState(commitment, clock.minute),
        gameMinute: clock.minute,
        startTime: formatGameMinute(commitment.startMinute),
        endTime: formatGameMinute(commitment.endMinute),
      }));
  },
});

export const checkInCommitment = mutation({
  args: { commitmentId: v.id('scheduledCommitments') },
  handler: async (ctx, args) => {
    const commitment = await ctx.db.get(args.commitmentId);
    if (!commitment) throw new Error('Scheduled commitment not found');
    if (commitment.status !== 'scheduled') {
      return { checkedIn: false, reason: 'already_resolved' as const, status: commitment.status };
    }

    const profile = await ctx.db.get(commitment.profileId);
    if (!profile) throw new Error('Life profile not found');
    if (
      profile.chapterId !== commitment.chapterId ||
      profile.chapterUnit !== commitment.chapterUnit
    ) {
      return { checkedIn: false, reason: 'wrong_day' as const };
    }

    const previousState = profile.state && typeof profile.state === 'object' ? profile.state : {};
    const clock = getDayClock(previousState, makeDayClockKey(profile));
    const temporalState = commitmentTemporalState(commitment, clock.minute);
    const now = Date.now();

    if (temporalState === 'upcoming') {
      return {
        checkedIn: false,
        reason: 'too_early' as const,
        startTime: formatGameMinute(commitment.startMinute),
      };
    }

    // Once the appointment has ended, attendance is resolved from the schedule
    // itself; the player does not need to walk back to the original location just
    // to make the missed/skipped state persistent.
    if (temporalState === 'expired') {
      const status = commitment.attendanceRequired ? 'missed' : 'skipped';
      await ctx.db.patch(commitment._id, { status, resolvedAt: now, updatedAt: now });
      await writeCommitmentLifeEvent(ctx, profile, commitment, status, now, {
        observedAtMinute: clock.minute,
      });
      return { checkedIn: false, reason: 'too_late' as const, status };
    }

    const runtime = await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', profile._id))
      .first();
    if (!runtime || runtime.activeLocationId !== commitment.locationId) {
      return { checkedIn: false, reason: 'wrong_location' as const };
    }

    // Fixed commitments outrank ambient/random scenes. If the player deliberately
    // checks in for class/meeting/presentation, close the current scene as an
    // interrupted narrative beat without charging its full authored duration.
    if (runtime.activeScenarioId) {
      if (runtime.activeRunId) {
        await ctx.db.patch(runtime.activeRunId, {
          endedAt: now,
          outcome: 'commitment_priority',
        });
      }
      await writeTelemetryForProfile(ctx, profile._id, {
        eventType: 'scene_exit',
        action: 'commitment_priority',
        sceneId: runtime.activeScenarioId,
        locationId: runtime.activeLocationId,
        payload: { commitmentKey: commitment.commitmentKey },
      });
      await ctx.db.patch(runtime._id, {
        activeScenarioId: undefined,
        activeRunId: undefined,
        updatedAt: now,
      });
    }

    const status = temporalState === 'late_window' ? 'attended_late' : 'attended_on_time';
    const remainingCommitmentMinutes = Math.max(0, commitment.endMinute - clock.minute);
    const nextClock =
      remainingCommitmentMinutes > 0
        ? spendMinutes(clock, remainingCommitmentMinutes)
        : clock;
    if (!nextClock) {
      return { checkedIn: false, reason: 'not_enough_time' as const };
    }

    await ctx.db.patch(profile._id, {
      state: { ...previousState, dayClock: nextClock },
      updatedAt: now,
    });
    await ctx.db.patch(commitment._id, {
      status,
      arrivedAtMinute: clock.minute,
      resolvedAt: now,
      updatedAt: now,
    });
    await writeCommitmentLifeEvent(ctx, profile, commitment, status, now, {
      arrivedAtMinute: clock.minute,
      endedAtMinute: nextClock.minute,
    });
    await writeTelemetryForProfile(ctx, profile._id, {
      eventType: 'interaction',
      action: 'commitment_attendance',
      locationId: commitment.locationId,
      payload: {
        commitmentKey: commitment.commitmentKey,
        kind: commitment.kind,
        status,
        scheduledStartMinute: commitment.startMinute,
        arrivedAtMinute: clock.minute,
        endedAtMinute: nextClock.minute,
      },
    });

    return {
      checkedIn: true,
      reason: 'attended' as const,
      status,
      arrivedAtMinute: clock.minute,
      gameMinute: nextClock.minute,
      gameTime: formatGameMinute(nextClock.minute),
    };
  },
});

export const skipCommitment = mutation({
  args: { commitmentId: v.id('scheduledCommitments') },
  handler: async (ctx, args) => {
    const commitment = await ctx.db.get(args.commitmentId);
    if (!commitment) throw new Error('Scheduled commitment not found');
    if (commitment.status !== 'scheduled') {
      return { skipped: false, reason: 'already_resolved' as const, status: commitment.status };
    }

    const profile = await ctx.db.get(commitment.profileId);
    if (!profile) throw new Error('Life profile not found');
    const now = Date.now();
    await ctx.db.patch(commitment._id, { status: 'skipped', resolvedAt: now, updatedAt: now });
    await writeCommitmentLifeEvent(ctx, profile, commitment, 'skipped', now, {
      explicitChoice: true,
    });
    await writeTelemetryForProfile(ctx, profile._id, {
      eventType: 'decision',
      action: 'commitment_skipped',
      locationId: commitment.locationId,
      payload: {
        commitmentKey: commitment.commitmentKey,
        kind: commitment.kind,
        attendanceRequired: commitment.attendanceRequired,
      },
    });

    return { skipped: true, reason: 'skipped' as const, status: 'skipped' as const };
  },
});

/** Resolve still-open commitments when a playable day ends. */
export const closeOpenCommitmentsForDay = async (
  ctx: any,
  profile: any,
  now = Date.now(),
) => {
  const commitments = await ctx.db
    .query('scheduledCommitments')
    .withIndex('byProfileChapterUnit', (q: any) =>
      q
        .eq('profileId', profile._id)
        .eq('chapterId', profile.chapterId)
        .eq('chapterUnit', profile.chapterUnit),
    )
    .collect();

  for (const commitment of commitments) {
    if (commitment.status !== 'scheduled') continue;
    const status = commitment.attendanceRequired ? 'missed' : 'skipped';
    await ctx.db.patch(commitment._id, { status, resolvedAt: now, updatedAt: now });
    await writeCommitmentLifeEvent(ctx, profile, commitment, status, now, {
      resolvedByDayEnd: true,
    });
  }
};
