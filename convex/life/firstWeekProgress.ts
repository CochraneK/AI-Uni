import { firstWeekEndCondition } from './firstWeek';

const uniqueAppend = (items: string[], value: string) =>
  items.includes(value) ? items : [...items, value];

const uniqueNumberAppend = (items: number[], value: number) =>
  items.includes(value) ? items : [...items, value].sort((a, b) => a - b);

export type FirstWeekReadiness = {
  ready: boolean;
  completedPlayableDays: number;
  completedCoreEvents: number;
  distinctNpcInteractions: number;
  ordinaryLifeCompleted: boolean;
  missing: string[];
};

const getProgress = async (ctx: any, profileId: any) =>
  await ctx.db
    .query('firstWeekProgress')
    .withIndex('byProfile', (q: any) => q.eq('profileId', profileId))
    .first();

const inferredCompletedDays = (profile: any) => {
  if (!profile || profile.chapterId !== 'university_first_week') return [];
  const completedCount = Math.max(0, Math.min(6, profile.chapterUnit - 1));
  return Array.from({ length: completedCount }, (_, index) => index + 1);
};

const getOrCreateProgress = async (ctx: any, profileId: any) => {
  const existing = await getProgress(ctx, profileId);
  if (existing) return existing;

  const profile = await ctx.db.get(profileId);
  const now = Date.now();
  const id = await ctx.db.insert('firstWeekProgress', {
    profileId,
    completedDays: inferredCompletedDays(profile),
    completedScenarioIds: [],
    ordinaryScenarioIds: [],
    distinctNpcIds: [],
    createdAt: now,
    updatedAt: now,
  });
  return await ctx.db.get(id);
};

export const recordFirstWeekScenarioCompletion = async (
  ctx: any,
  profileId: any,
  scenarioId: string,
  isOrdinaryLife: boolean,
) => {
  const profile = await ctx.db.get(profileId);
  if (!profile || profile.chapterId !== 'university_first_week') return false;

  const progress = await getOrCreateProgress(ctx, profileId);
  if (!progress) return false;

  const completedScenarioIds = uniqueAppend(progress.completedScenarioIds, scenarioId);
  const ordinaryScenarioIds = isOrdinaryLife
    ? uniqueAppend(progress.ordinaryScenarioIds, scenarioId)
    : progress.ordinaryScenarioIds;

  await ctx.db.patch(progress._id, {
    completedScenarioIds,
    ordinaryScenarioIds,
    updatedAt: Date.now(),
  });
  return true;
};

export const recordFirstWeekNpcInteraction = async (
  ctx: any,
  profileId: any,
  npcId: string,
) => {
  const profile = await ctx.db.get(profileId);
  if (!profile || profile.chapterId !== 'university_first_week') return false;

  const progress = await getOrCreateProgress(ctx, profileId);
  if (!progress) return false;

  await ctx.db.patch(progress._id, {
    distinctNpcIds: uniqueAppend(progress.distinctNpcIds, npcId),
    updatedAt: Date.now(),
  });
  return true;
};

export const recordFirstWeekNpcInteractionForHumanToken = async (
  ctx: any,
  humanToken: string,
  npcId?: string,
) => {
  if (!npcId) return false;
  const profile = await ctx.db
    .query('lifeProfiles')
    .withIndex('byProfileKey', (q: any) => q.eq('profileKey', `ai-uni:${humanToken}`))
    .first();
  if (!profile) return false;
  return await recordFirstWeekNpcInteraction(ctx, profile._id, npcId);
};

export const markFirstWeekDayCompleted = async (
  ctx: any,
  profileId: any,
  day: number,
) => {
  const progress = await getOrCreateProgress(ctx, profileId);
  if (!progress) return false;
  await ctx.db.patch(progress._id, {
    completedDays: uniqueNumberAppend(progress.completedDays, day),
    updatedAt: Date.now(),
  });
  return true;
};

export const evaluateFirstWeekReadiness = async (
  ctx: any,
  profileId: any,
  includeCurrentDay?: number,
): Promise<FirstWeekReadiness> => {
  const progress = (await getProgress(ctx, profileId)) ?? (await getOrCreateProgress(ctx, profileId));
  const completedDays = progress?.completedDays ?? [];
  const effectiveDays = includeCurrentDay
    ? uniqueNumberAppend(completedDays, includeCurrentDay)
    : completedDays;
  const completedCoreEvents = progress?.completedScenarioIds.length ?? 0;
  const distinctNpcInteractions = progress?.distinctNpcIds.length ?? 0;
  const ordinaryLifeCompleted = (progress?.ordinaryScenarioIds.length ?? 0) > 0;

  const missing: string[] = [];
  if (effectiveDays.length < firstWeekEndCondition.requiredPlayableDays) {
    missing.push(
      `还需要完成 ${firstWeekEndCondition.requiredPlayableDays - effectiveDays.length} 个可玩日`,
    );
  }
  if (completedCoreEvents < firstWeekEndCondition.minimumCoreEvents) {
    missing.push(
      `还需要完成 ${firstWeekEndCondition.minimumCoreEvents - completedCoreEvents} 个生活事件`,
    );
  }
  if (distinctNpcInteractions < firstWeekEndCondition.minimumDistinctNpcInteractions) {
    missing.push(
      `还需要和 ${firstWeekEndCondition.minimumDistinctNpcInteractions - distinctNpcInteractions} 位不同的人真正互动`,
    );
  }
  if (firstWeekEndCondition.requireOrdinaryLifeCompletion && !ordinaryLifeCompleted) {
    missing.push('还需要完成至少一个纯日常生活事件');
  }

  return {
    ready: missing.length === 0,
    completedPlayableDays: effectiveDays.length,
    completedCoreEvents,
    distinctNpcInteractions,
    ordinaryLifeCompleted,
    missing,
  };
};
