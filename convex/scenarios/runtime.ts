import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { defaultLifeProfile } from '../life/model';
import type { LifeProfileSnapshot, RelationshipType } from '../life/types';
import {
  getDayClock,
  makeDayClockKey,
  minutesRemainingInDay,
  spendMinutes,
} from '../life/dayClock';
import type { WorldLocationId } from '../world/locations';
import { worldLocations } from '../world/locations';
import { estimateCampusTravelMinutes } from '../world/travel';
import { getUniversityProfile } from '../campus/registry';
import { npcRoleTagsForName } from '../../data/npcProfiles';
import { writeTelemetryForProfile } from '../research/telemetry';
import { contentPacks, getScenario } from './registry';
import { buildScenarioCandidates, selectScenario } from './controller';
import { completeScenarioRun } from './completion';

const MAX_RECENT_SCENARIOS = 8;

const knownPackIds = new Set(contentPacks.map((pack) => pack.id));

const normalizePackIds = (packIds: string[]) =>
  [...new Set(packIds)].filter((packId) => knownPackIds.has(packId));

const defaultPackIdsForProfile = (universityProfileId?: string) => {
  const profile = universityProfileId ? getUniversityProfile(universityProfileId) : undefined;
  const configured = profile?.themePackIds ?? [];
  const coreEnabled = contentPacks.filter((pack) => pack.status === 'enabled').map((pack) => pack.id);
  return normalizePackIds([...configured, ...coreEnabled]);
};

const lifeSnapshotFromDocument = (profile: any): LifeProfileSnapshot => ({
  ...defaultLifeProfile,
  ...((profile.state && typeof profile.state === 'object' ? profile.state : {}) as Partial<LifeProfileSnapshot>),
  age: profile.age,
  season: profile.season,
  lifeStage: profile.lifeStage,
  chapterId: profile.chapterId,
  chapterUnit: profile.chapterUnit,
  totalGameDays: profile.totalGameDays,
  academicYear: profile.academicYear,
  careerStage: profile.careerStage,
  universityProfileId: profile.universityProfileId,
});

const pushRecent = (recent: string[], scenarioId: string) =>
  [...recent, scenarioId].slice(-MAX_RECENT_SCENARIOS);

const squaredDistance = (
  a: { x: number; y: number },
  b: { x: number; y: number },
) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

type PlayerDescriptionLite = {
  playerId: string;
  name: string;
};

const assignScenarioNpcs = async (
  ctx: any,
  worldId: any,
  profileKey: string,
  roles: string[],
) => {
  if (roles.length === 0) return [];
  const world = await ctx.db.get(worldId);
  if (!world) return [];

  const tokenPrefix = 'ai-uni:';
  const humanToken = profileKey.startsWith(tokenPrefix)
    ? profileKey.slice(tokenPrefix.length)
    : undefined;
  const humanPlayer = humanToken
    ? world.players.find((player: any) => player.human === humanToken)
    : world.players.find((player: any) => Boolean(player.human));
  if (!humanPlayer) return [];

  const descriptions = await ctx.db
    .query('playerDescriptions')
    .withIndex('worldId', (q: any) => q.eq('worldId', worldId))
    .collect();
  const descriptionByPlayer = new Map<string, PlayerDescriptionLite>(
    descriptions.map((description: any) => [
      description.playerId,
      { playerId: description.playerId, name: description.name },
    ]),
  );

  const candidates = world.agents
    .map((agent: any) => world.players.find((player: any) => player.id === agent.playerId))
    .filter((player: any) => player && player.id !== humanPlayer.id)
    .sort(
      (a: any, b: any) =>
        squaredDistance(a.position, humanPlayer.position) -
        squaredDistance(b.position, humanPlayer.position),
    );

  const used = new Set<string>();
  const assignments: Array<{ playerId: any; role: string }> = [];

  for (const role of roles) {
    const matching = candidates.find((candidate: any) => {
      if (used.has(candidate.id)) return false;
      const name = descriptionByPlayer.get(candidate.id)?.name;
      return name ? npcRoleTagsForName(name).includes(role) : false;
    });
    const fallback = candidates.find((candidate: any) => !used.has(candidate.id));
    const selected = matching ?? fallback;
    if (!selected) break;

    used.add(selected.id);
    assignments.push({ playerId: selected.id, role });
  }

  return assignments;
};

export const createScenarioRuntime = mutation({
  args: {
    profileId: v.id('lifeProfiles'),
    worldId: v.optional(v.id('worlds')),
    enabledPackIds: v.optional(v.array(v.string())),
    behavioralResearchConsent: v.optional(v.boolean()),
    sensitiveResearchConsent: v.optional(v.boolean()),
    seed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Life profile not found');

    const existing = await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', args.profileId))
      .first();
    if (existing) return existing._id;

    const behavioralResearchConsent = args.behavioralResearchConsent ?? false;
    const sensitiveResearchConsent = args.sensitiveResearchConsent ?? false;
    if (sensitiveResearchConsent && !behavioralResearchConsent) {
      throw new Error('Sensitive research consent requires behavioral research consent.');
    }

    const enabledPackIds = normalizePackIds(
      args.enabledPackIds ?? defaultPackIdsForProfile(profile.universityProfileId),
    );
    const now = Date.now();

    return await ctx.db.insert('scenarioRuntimeStates', {
      profileId: args.profileId,
      worldId: args.worldId ?? profile.worldId,
      enabledPackIds,
      behavioralResearchConsent,
      sensitiveResearchConsent,
      recentScenarioIds: [],
      completedScenarioIds: [],
      selectionIndex: 0,
      seed: args.seed ?? `profile:${profile.profileKey}`,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getScenarioRuntime = query({
  args: { profileId: v.id('lifeProfiles') },
  handler: async (ctx, args) =>
    await ctx.db
      .query('scenarioRuntimeStates')
      .withIndex('byProfile', (q) => q.eq('profileId', args.profileId))
      .first(),
});

export const setScenarioResearchConsent = mutation({
  args: {
    runtimeId: v.id('scenarioRuntimeStates'),
    behavioralResearchConsent: v.boolean(),
    sensitiveResearchConsent: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.sensitiveResearchConsent && !args.behavioralResearchConsent) {
      throw new Error('Sensitive research consent requires behavioral research consent.');
    }
    const runtime = await ctx.db.get(args.runtimeId);
    if (!runtime) throw new Error('Scenario runtime not found');

    await ctx.db.patch(args.runtimeId, {
      behavioralResearchConsent: args.behavioralResearchConsent,
      sensitiveResearchConsent: args.sensitiveResearchConsent,
      updatedAt: Date.now(),
    });
  },
});

export const setEnabledScenarioPacks = mutation({
  args: {
    runtimeId: v.id('scenarioRuntimeStates'),
    enabledPackIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const runtime = await ctx.db.get(args.runtimeId);
    if (!runtime) throw new Error('Scenario runtime not found');

    const normalized = normalizePackIds(args.enabledPackIds);
    if (normalized.length !== new Set(args.enabledPackIds).size) {
      const unknown = args.enabledPackIds.filter((packId) => !knownPackIds.has(packId));
      if (unknown.length > 0) throw new Error(`Unknown content pack(s): ${unknown.join(', ')}`);
    }

    await ctx.db.patch(args.runtimeId, {
      enabledPackIds: normalized,
      updatedAt: Date.now(),
    });
  },
});

export const enterScenarioLocation = mutation({
  args: {
    runtimeId: v.id('scenarioRuntimeStates'),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    const runtime = await ctx.db.get(args.runtimeId);
    if (!runtime) throw new Error('Scenario runtime not found');

    const locationId = args.locationId as WorldLocationId;
    const location = worldLocations[locationId];
    if (!location) throw new Error(`Unknown world location: ${args.locationId}`);
    if (location.mapStatus !== 'playable') {
      throw new Error(`Location ${args.locationId} is not playable yet.`);
    }

    // Zone transition calls are idempotent. Remaining inside the same zone does
    // not repeatedly reroll scenes or charge walking time on movement ticks.
    if (runtime.activeLocationId === locationId) {
      if (runtime.lastKnownLocationId !== locationId) {
        await ctx.db.patch(args.runtimeId, {
          lastKnownLocationId: locationId,
          updatedAt: Date.now(),
        });
      }
      return {
        locationId,
        scenario: runtime.activeScenarioId ? getScenario(runtime.activeScenarioId) : undefined,
        changed: false,
        travelMinutes: 0,
      };
    }

    const now = Date.now();
    if (runtime.activeRunId) {
      await ctx.db.patch(runtime.activeRunId, {
        endedAt: now,
        outcome: 'location_changed',
      });
      await writeTelemetryForProfile(ctx, runtime.profileId, {
        eventType: 'scene_exit',
        action: 'location_changed',
        sceneId: runtime.activeScenarioId,
        locationId: runtime.activeLocationId,
      });
    }

    const profile = await ctx.db.get(runtime.profileId);
    if (!profile) throw new Error('Life profile not found');
    const profileState =
      profile.state && typeof profile.state === 'object' ? profile.state : {};
    let clock = getDayClock(profileState, makeDayClockKey(profile));

    const previousLocationId = runtime.lastKnownLocationId as WorldLocationId | undefined;
    const universityProfile = getUniversityProfile(profile.universityProfileId);
    const estimatedTravelMinutes = previousLocationId
      ? estimateCampusTravelMinutes(
          universityProfile?.mapId,
          previousLocationId,
          locationId,
        ) ?? 0
      : 0;
    const travelMinutes = Math.min(
      estimatedTravelMinutes,
      minutesRemainingInDay(clock),
    );
    const travelStartedAtGameMinute = clock.minute;

    if (travelMinutes > 0) {
      const nextClock = spendMinutes(clock, travelMinutes);
      if (nextClock) {
        clock = nextClock;
        await ctx.db.patch(profile._id, {
          state: {
            ...profileState,
            dayClock: nextClock,
          },
          updatedAt: now,
        });
      }
    }

    const remainingMinutes = minutesRemainingInDay(clock);

    await writeTelemetryForProfile(ctx, runtime.profileId, {
      eventType: 'movement',
      action: 'location_enter',
      locationId,
      payload: {
        ...(previousLocationId ? { fromLocationId: previousLocationId } : {}),
        travelMinutes,
        travelStartedAtGameMinute,
        travelEndedAtGameMinute: clock.minute,
      },
    });

    const taskStates = await ctx.db
      .query('developmentalTaskStates')
      .withIndex('byProfileTask', (q) => q.eq('profileId', runtime.profileId))
      .collect();
    const activeDevelopmentalTasks = taskStates
      .filter((state) => state.status === 'active' || state.status === 'reopened')
      .map((state) => state.taskId);

    const relationshipStates = await ctx.db
      .query('relationshipStates')
      .withIndex('byProfileType', (q) => q.eq('profileId', runtime.profileId))
      .collect();
    const availableRelationshipTypes = [
      ...new Set(relationshipStates.map((state) => state.relationshipType as RelationshipType)),
    ];

    const selectionContext = {
      locationId,
      life: {
        profile: lifeSnapshotFromDocument(profile),
        activeDevelopmentalTasks,
        availableRelationshipTypes,
      },
      enabledPackIds: runtime.enabledPackIds,
      recentScenarioIds: runtime.recentScenarioIds,
      completedScenarioIds: runtime.completedScenarioIds,
      sensitiveResearchConsent: runtime.sensitiveResearchConsent,
      gameMinute: clock.minute,
      remainingMinutes,
      seed: runtime.seed,
      selectionIndex: runtime.selectionIndex,
    };

    const candidates = buildScenarioCandidates(selectionContext);
    const selected = selectScenario(selectionContext);
    const nextSelectionIndex = runtime.selectionIndex + 1;

    if (!selected) {
      await ctx.db.patch(args.runtimeId, {
        activeLocationId: locationId,
        lastKnownLocationId: locationId,
        activeScenarioId: undefined,
        activeRunId: undefined,
        locationEnteredAt: now,
        selectionIndex: nextSelectionIndex,
        updatedAt: now,
      });
      return {
        locationId,
        scenario: undefined,
        changed: true,
        travelMinutes,
        gameMinute: clock.minute,
      };
    }

    const npcAssignments = runtime.worldId
      ? await assignScenarioNpcs(
          ctx,
          runtime.worldId,
          profile.profileKey,
          selected.scenario.npcRoles,
        )
      : [];

    const runId = await ctx.db.insert('scenarioRuns', {
      runtimeId: args.runtimeId,
      profileId: runtime.profileId,
      scenarioId: selected.scenario.id,
      locationId,
      startedAt: now,
      startedAtGameMinute: clock.minute,
      estimatedMinutes: selected.scenario.estimatedMinutes,
      selectionIndex: runtime.selectionIndex,
      selectionReasons: selected.reasons,
      candidateCount: candidates.length,
      npcAssignments,
    });

    await ctx.db.patch(args.runtimeId, {
      activeLocationId: locationId,
      lastKnownLocationId: locationId,
      activeScenarioId: selected.scenario.id,
      activeRunId: runId,
      locationEnteredAt: now,
      recentScenarioIds: pushRecent(runtime.recentScenarioIds, selected.scenario.id),
      selectionIndex: nextSelectionIndex,
      updatedAt: now,
    });

    await writeTelemetryForProfile(ctx, runtime.profileId, {
      eventType: 'scene_enter',
      action: 'scenario_started',
      sceneId: selected.scenario.id,
      locationId,
      payload: {
        assignedNpcCount: npcAssignments.length,
        estimatedMinutes: selected.scenario.estimatedMinutes,
        startedAtGameMinute: clock.minute,
      },
    });

    return {
      locationId,
      scenario: selected.scenario,
      npcAssignments,
      changed: true,
      travelMinutes,
      startedAtGameMinute: clock.minute,
    };
  },
});

export const completeActiveScenario = mutation({
  args: {
    runtimeId: v.id('scenarioRuntimeStates'),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    await completeScenarioRun(ctx, args.runtimeId, {
      outcome: args.outcome ?? 'completed',
    }),
});

export const leaveScenarioLocation = mutation({
  args: { runtimeId: v.id('scenarioRuntimeStates') },
  handler: async (ctx, args) => {
    const runtime = await ctx.db.get(args.runtimeId);
    if (!runtime) throw new Error('Scenario runtime not found');

    const now = Date.now();
    if (runtime.activeRunId) {
      await ctx.db.patch(runtime.activeRunId, {
        endedAt: now,
        outcome: 'left_location',
      });
      await writeTelemetryForProfile(ctx, runtime.profileId, {
        eventType: 'scene_exit',
        action: 'left_location',
        sceneId: runtime.activeScenarioId,
        locationId: runtime.activeLocationId,
      });
    }

    // lastKnownLocationId deliberately survives an unzoned corridor. The next
    // semantic zone entry can therefore charge one travel block from the true
    // previous campus place instead of losing the origin midway through a walk.
    await ctx.db.patch(args.runtimeId, {
      activeLocationId: undefined,
      activeScenarioId: undefined,
      activeRunId: undefined,
      locationEnteredAt: undefined,
      updatedAt: now,
    });
  },
});

export const listScenarioRuns = query({
  args: { runtimeId: v.id('scenarioRuntimeStates') },
  handler: async (ctx, args) =>
    await ctx.db
      .query('scenarioRuns')
      .withIndex('byRuntimeTime', (q) => q.eq('runtimeId', args.runtimeId))
      .collect(),
});
