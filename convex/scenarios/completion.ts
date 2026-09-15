import {
  formatGameMinute,
  getDayClock,
  makeDayClockKey,
  spendMinutes,
} from '../life/dayClock';
import { recordFirstWeekScenarioCompletion } from '../life/firstWeekProgress';
import { writeTelemetryForProfile } from '../research/telemetry';
import { getScenario } from './registry';

const MAX_COMPLETED_SCENARIOS = 256;

const uniqueCompleted = (completed: string[], scenarioId: string) => {
  if (completed.includes(scenarioId)) return completed;
  return [...completed, scenarioId].slice(-MAX_COMPLETED_SCENARIOS);
};

export type CompleteScenarioOptions = {
  outcome: string;
  npcId?: string;
  telemetryPayload?: Record<string, unknown>;
};

export type CompleteScenarioResult =
  | {
      completed: true;
      reason: 'completed';
      scenarioId: string;
      estimatedMinutes: number;
      startedAtGameMinute: number;
      endedAtGameMinute: number;
      gameTime: string;
    }
  | {
      completed: false;
      reason: 'no_active_scenario' | 'already_completed' | 'not_enough_time';
      scenarioId?: string;
      estimatedMinutes?: number;
      gameMinute?: number;
      gameTime?: string;
    };

/**
 * The single settlement path for a successfully completed scenario.
 *
 * Manual completion and dialogue auto-completion both call this helper so a
 * run can advance the game clock at most once. Aborted runs (location change,
 * day end) deliberately do not spend the scenario's full narrative duration.
 */
export const completeScenarioRun = async (
  ctx: any,
  runtimeId: any,
  options: CompleteScenarioOptions,
): Promise<CompleteScenarioResult> => {
  const runtime = await ctx.db.get(runtimeId);
  if (!runtime) throw new Error('Scenario runtime not found');
  if (!runtime.activeScenarioId || !runtime.activeRunId) {
    return { completed: false, reason: 'no_active_scenario' };
  }

  const scenarioId = runtime.activeScenarioId;
  const scenario = getScenario(scenarioId);
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  const run = await ctx.db.get(runtime.activeRunId);
  if (!run) throw new Error('Scenario run not found');
  if (run.endedAt) {
    return {
      completed: false,
      reason: 'already_completed',
      scenarioId,
      estimatedMinutes: scenario.estimatedMinutes,
    };
  }

  const profile = await ctx.db.get(runtime.profileId);
  if (!profile) throw new Error('Life profile not found');

  const previousState =
    profile.state && typeof profile.state === 'object' ? profile.state : {};
  const dayKey = makeDayClockKey(profile);
  const clock = getDayClock(previousState, dayKey);
  const nextClock = spendMinutes(clock, scenario.estimatedMinutes);

  // A newly selected scenario should always fit because selection filters by
  // remaining time. This guard keeps legacy/stale runs safe instead of forcing
  // the clock past the day boundary.
  if (!nextClock) {
    return {
      completed: false,
      reason: 'not_enough_time',
      scenarioId,
      estimatedMinutes: scenario.estimatedMinutes,
      gameMinute: clock.minute,
      gameTime: formatGameMinute(clock.minute),
    };
  }

  const now = Date.now();
  const startedAtGameMinute = run.startedAtGameMinute ?? clock.minute;

  await ctx.db.patch(profile._id, {
    state: {
      ...previousState,
      dayClock: nextClock,
    },
    updatedAt: now,
  });

  await ctx.db.patch(run._id, {
    endedAt: now,
    outcome: options.outcome,
    startedAtGameMinute,
    endedAtGameMinute: nextClock.minute,
    estimatedMinutes: run.estimatedMinutes ?? scenario.estimatedMinutes,
  });

  await ctx.db.patch(runtime._id, {
    activeScenarioId: undefined,
    activeRunId: undefined,
    completedScenarioIds: uniqueCompleted(runtime.completedScenarioIds, scenarioId),
    updatedAt: now,
  });

  await recordFirstWeekScenarioCompletion(
    ctx,
    runtime.profileId,
    scenarioId,
    scenario.researchUse === 'none',
  );

  await writeTelemetryForProfile(ctx, runtime.profileId, {
    eventType: 'scene_exit',
    action: options.outcome,
    sceneId: scenarioId,
    locationId: runtime.activeLocationId,
    npcId: options.npcId,
    payload: {
      estimatedMinutes: scenario.estimatedMinutes,
      startedAtGameMinute,
      endedAtGameMinute: nextClock.minute,
      ...(options.telemetryPayload ?? {}),
    },
  });

  return {
    completed: true,
    reason: 'completed',
    scenarioId,
    estimatedMinutes: scenario.estimatedMinutes,
    startedAtGameMinute,
    endedAtGameMinute: nextClock.minute,
    gameTime: formatGameMinute(nextClock.minute),
  };
};
