import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { defaultLifeProfile } from '../life/model';
import type { LifeProfileSnapshot, RelationshipType } from '../life/types';
import type { WorldLocationId } from '../world/locations';
import { worldLocations } from '../world/locations';
import { getUniversityProfile } from '../campus/registry';
import { contentPacks, getScenario } from './registry';
import { buildScenarioCandidates, selectScenario } from './controller';

const MAX_RECENT_SCENARIOS = 8;
const MAX_COMPLETED_SCENARIOS = 256;

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

const uniqueCompleted = (completed: string[], scenarioId: string) => {
  if (completed.includes(scenarioId)) return completed;
  return [...completed, scenarioId].slice(-MAX_COMPLETED_SCENARIOS);
};

const pushRecent = (recent: string[], scenarioId: string) =>
  [...recent, scenarioId].slice(-MAX_RECENT_SCENARIOS);

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
    // not repeatedly reroll scenes on every movement tick.
    if (runtime.activeLocationId === locationId) {
      return {
        locationId,
        scenario: runtime.activeScenarioId ? getScenario(runtime.activeScenarioId) : undefined,
        changed: false,
      };
    }

    const now = Date.now();
    if (runtime.activeRunId) {
      await ctx.db.patch(runtime.activeRunId, {
        endedAt: now,
        outcome: 'location_changed',
      });
    }

    const profile = await ctx.db.get(runtime.profileId);
    if (!profile) throw new Error('Life profile not found');

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
      seed: runtime.seed,
      selectionIndex: runtime.selectionIndex,
    };

    const candidates = buildScenarioCandidates(selectionContext);
    const selected = selectScenario(selectionContext);
    const nextSelectionIndex = runtime.selectionIndex + 1;

    if (!selected) {
      await ctx.db.patch(args.runtimeId, {
        activeLocationId: locationId,
        activeScenarioId: undefined,
        activeRunId: undefined,
        locationEnteredAt: now,
        selectionIndex: nextSelectionIndex,
        updatedAt: now,
      });
      return { locationId, scenario: undefined, changed: true };
    }

    const runId = await ctx.db.insert('scenarioRuns', {
      runtimeId: args.runtimeId,
      profileId: runtime.profileId,
      scenarioId: selected.scenario.id,
      locationId,
      startedAt: now,
      selectionIndex: runtime.selectionIndex,
      selectionReasons: selected.reasons,
      candidateCount: candidates.length,
    });

    await ctx.db.patch(args.runtimeId, {
      activeLocationId: locationId,
      activeScenarioId: selected.scenario.id,
      activeRunId: runId,
      locationEnteredAt: now,
      recentScenarioIds: pushRecent(runtime.recentScenarioIds, selected.scenario.id),
      selectionIndex: nextSelectionIndex,
      updatedAt: now,
    });

    return { locationId, scenario: selected.scenario, changed: true };
  },
});

export const completeActiveScenario = mutation({
  args: {
    runtimeId: v.id('scenarioRuntimeStates'),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const runtime = await ctx.db.get(args.runtimeId);
    if (!runtime) throw new Error('Scenario runtime not found');
    if (!runtime.activeScenarioId) return null;

    const now = Date.now();
    if (runtime.activeRunId) {
      await ctx.db.patch(runtime.activeRunId, {
        endedAt: now,
        outcome: args.outcome ?? 'completed',
      });
    }

    const completedScenarioIds = uniqueCompleted(
      runtime.completedScenarioIds,
      runtime.activeScenarioId,
    );
    const completedScenarioId = runtime.activeScenarioId;

    await ctx.db.patch(args.runtimeId, {
      activeScenarioId: undefined,
      activeRunId: undefined,
      completedScenarioIds,
      updatedAt: now,
    });

    return completedScenarioId;
  },
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
    }

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
