import { getScenario } from './registry';
import { completeScenarioRun } from './completion';

const uniqueAppend = (items: string[], value: string) =>
  items.includes(value) ? items : [...items, value];

export const scenarioAutoCompletionThreshold = (scenario: ReturnType<typeof getScenario>) => {
  if (!scenario) return undefined;
  if (scenario.safetyLevel === 'sensitive') return undefined;
  if (scenario.researchUse === 'none') return 1;
  if (scenario.safetyLevel === 'mild_stress') return 3;
  return 2;
};

export const recordScenarioDialogueProgress = async (
  ctx: any,
  humanToken: string,
  npcId?: string,
) => {
  if (!npcId) return { tracked: false, completed: false };

  const profile = await ctx.db
    .query('lifeProfiles')
    .withIndex('byProfileKey', (q: any) => q.eq('profileKey', `ai-uni:${humanToken}`))
    .first();
  if (!profile) return { tracked: false, completed: false };

  const runtime = await ctx.db
    .query('scenarioRuntimeStates')
    .withIndex('byProfile', (q: any) => q.eq('profileId', profile._id))
    .first();
  if (!runtime?.activeRunId || !runtime.activeScenarioId) {
    return { tracked: false, completed: false };
  }

  const run = await ctx.db.get(runtime.activeRunId);
  if (!run || run.endedAt) return { tracked: false, completed: false };

  const assignedNpcIds = new Set(
    (run.npcAssignments ?? []).map((assignment: any) => assignment.playerId as string),
  );
  if (assignedNpcIds.size > 0 && !assignedNpcIds.has(npcId)) {
    return { tracked: false, completed: false };
  }

  const scenario = getScenario(runtime.activeScenarioId);
  const threshold = scenarioAutoCompletionThreshold(scenario);
  const humanMessageCount = (run.humanMessageCount ?? 0) + 1;
  const interactedNpcIds = uniqueAppend(run.interactedNpcIds ?? [], npcId);

  await ctx.db.patch(run._id, {
    humanMessageCount,
    interactedNpcIds,
  });

  if (!threshold || humanMessageCount < threshold || !scenario) {
    return {
      tracked: true,
      completed: false,
      humanMessageCount,
      threshold,
    };
  }

  const completion = await completeScenarioRun(ctx, runtime._id, {
    outcome: 'auto_completed_dialogue',
    npcId,
    telemetryPayload: {
      humanMessageCount,
      completionThreshold: threshold,
    },
  });

  return {
    tracked: true,
    completed: completion.completed,
    humanMessageCount,
    threshold,
    scenarioId: completion.scenarioId,
    completionReason: completion.reason,
    gameTime: completion.completed ? completion.gameTime : completion.gameTime,
  };
};
