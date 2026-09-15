import type { Id } from '../_generated/dataModel';

export type MinimalTelemetryEvent = {
  gameDay?: number;
  sceneId?: string;
  locationId?: string;
  npcId?: string;
  eventType:
    | 'movement'
    | 'interaction'
    | 'dialogue'
    | 'decision'
    | 'scene_enter'
    | 'scene_exit'
    | 'latency'
    | 'system';
  action?: string;
  responseLatencyMs?: number;
  payload?: unknown;
};

const researchContextForProfile = async (ctx: any, profile: any) => {
  if (!profile?.sessionId) return null;

  const runtime = await ctx.db
    .query('scenarioRuntimeStates')
    .withIndex('byProfile', (q: any) => q.eq('profileId', profile._id))
    .first();
  if (!runtime?.behavioralResearchConsent) return null;

  const session = await ctx.db.get(profile.sessionId);
  if (!session || session.endedAt) return null;

  return { profile, runtime, session };
};

export const researchContextForHumanToken = async (ctx: any, humanToken: string) => {
  const profile = await ctx.db
    .query('lifeProfiles')
    .withIndex('byProfileKey', (q: any) => q.eq('profileKey', `ai-uni:${humanToken}`))
    .first();
  return await researchContextForProfile(ctx, profile);
};

export const researchContextForProfileId = async (ctx: any, profileId: any) => {
  const profile = await ctx.db.get(profileId);
  return await researchContextForProfile(ctx, profile);
};

export const writeMinimalTelemetry = async (
  ctx: any,
  sessionId: Id<'researchSessions'>,
  event: MinimalTelemetryEvent,
) => {
  await ctx.db.insert('telemetryEvents', {
    sessionId,
    timestamp: Date.now(),
    gameDay: event.gameDay,
    sceneId: event.sceneId,
    locationId: event.locationId,
    npcId: event.npcId,
    eventType: event.eventType,
    action: event.action,
    responseLatencyMs: event.responseLatencyMs,
    payload: event.payload,
  });
};

const writeFromResearchContext = async (
  ctx: any,
  context: any,
  event: MinimalTelemetryEvent,
) => {
  if (!context) return false;
  await writeMinimalTelemetry(ctx, context.session._id, {
    ...event,
    gameDay: event.gameDay ?? context.profile.totalGameDays,
    sceneId: event.sceneId ?? context.runtime.activeScenarioId,
    locationId: event.locationId ?? context.runtime.activeLocationId,
  });
  return true;
};

export const writeTelemetryForHumanToken = async (
  ctx: any,
  humanToken: string,
  event: MinimalTelemetryEvent,
) =>
  await writeFromResearchContext(
    ctx,
    await researchContextForHumanToken(ctx, humanToken),
    event,
  );

export const writeTelemetryForProfile = async (
  ctx: any,
  profileId: any,
  event: MinimalTelemetryEvent,
) =>
  await writeFromResearchContext(
    ctx,
    await researchContextForProfileId(ctx, profileId),
    event,
  );

export const telemetryDataMinimizationRules = [
  'Ordinary gameplay must function with behavioralResearchConsent=false.',
  'Do not copy raw dialogue text into telemetryEvents by default.',
  'Prefer event metadata such as direction, length, scene, timing and participant IDs.',
  'Precise high-frequency movement should not be logged every frame; use meaningful transitions or preregistered sampling.',
  'A research session must exist and remain open before telemetry can be written.',
  'Sensitive research requires the separate sensitiveResearchConsent gate in addition to behavioral consent.',
] as const;
