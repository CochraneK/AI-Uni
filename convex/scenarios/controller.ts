import type { ScenarioDefinition } from '../content/types';
import type { ScenarioLifeRuntimeContext } from './lifeFilter';
import { scenarioMatchesLifeContext } from './lifeFilter';
import { allScenarios, getContentPack } from './registry';
import type { WorldLocationId } from '../world/locations';
import { worldLocations } from '../world/locations';

export type ScenarioSelectionContext = {
  locationId: WorldLocationId;
  life: ScenarioLifeRuntimeContext;
  enabledPackIds: string[];
  recentScenarioIds: string[];
  completedScenarioIds?: string[];
  sensitiveResearchConsent: boolean;
  /** Remaining playable minutes in the current game day. */
  remainingMinutes?: number;
  seed: string;
  selectionIndex: number;
};

export type WeightedScenarioCandidate = {
  scenario: ScenarioDefinition;
  weight: number;
  reasons: string[];
};

const stableHash01 = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
};

const researchWeight = (scenario: ScenarioDefinition) => {
  if (scenario.researchUse === 'none') return 3.4;
  if (scenario.researchUse === 'behavioral_feature') return 1.25;
  return 0.25;
};

const safetyWeight = (scenario: ScenarioDefinition) => {
  if (scenario.safetyLevel === 'ordinary') return 1;
  if (scenario.safetyLevel === 'mild_stress') return 0.75;
  return 0.35;
};

export const scenarioCanRun = (
  scenario: ScenarioDefinition,
  context: ScenarioSelectionContext,
): boolean => {
  if (!context.enabledPackIds.includes(scenario.packId)) return false;
  if (scenario.location !== context.locationId) return false;

  const location = worldLocations[scenario.location];
  if (!location || location.mapStatus !== 'playable') return false;

  const pack = getContentPack(scenario.packId);
  if (!pack) return false;

  // Enabled packs only expose their default scenarios. Planned packs are an
  // explicit opt-in mechanism: once deliberately enabled, their scenarios may
  // enter the pool subject to life-stage/location/safety gates.
  if (pack.status === 'enabled' && !scenario.enabledByDefault) return false;

  if (
    (scenario.safetyLevel === 'sensitive' || scenario.packId === 'sensitive-research') &&
    !context.sensitiveResearchConsent
  ) {
    return false;
  }

  // Time is a gameplay constraint, not a psychological variable. A scene that
  // cannot fit before the day cutoff is excluded before weighted selection so
  // the player never enters an event that the clock cannot finish.
  if (
    context.remainingMinutes !== undefined &&
    scenario.estimatedMinutes > Math.max(0, context.remainingMinutes)
  ) {
    return false;
  }

  return scenarioMatchesLifeContext(scenario, context.life);
};

export const buildScenarioCandidates = (
  context: ScenarioSelectionContext,
): WeightedScenarioCandidate[] => {
  const recent = context.recentScenarioIds;
  const recentSet = new Set(recent.slice(-4));
  const recentScenarios = recent
    .map((id) => allScenarios.find((scenario) => scenario.id === id))
    .filter((scenario): scenario is ScenarioDefinition => Boolean(scenario));
  const recentResearchCount = recentScenarios
    .slice(-5)
    .filter((scenario) => scenario.researchUse !== 'none').length;

  const runnable = allScenarios.filter((scenario) => scenarioCanRun(scenario, context));
  const hasNonRecentAlternative = runnable.some((scenario) => !recentSet.has(scenario.id));

  return runnable
    .map((scenario) => {
      const reasons: string[] = [];
      let weight = researchWeight(scenario) * safetyWeight(scenario);

      if (scenario.researchUse === 'none') reasons.push('ordinary-life-priority');
      if (scenario.researchUse !== 'none' && recentResearchCount >= 3) {
        weight *= 0.35;
        reasons.push('research-density-penalty');
      }

      if (recentSet.has(scenario.id) && hasNonRecentAlternative) {
        weight *= 0.08;
        reasons.push('recent-repeat-penalty');
      }

      const lastScenario =
        recentScenarios.length > 0 ? recentScenarios[recentScenarios.length - 1] : undefined;
      if (
        lastScenario?.packId === scenario.packId &&
        runnable.some((candidate) => candidate.packId !== scenario.packId)
      ) {
        weight *= 0.7;
        reasons.push('pack-diversity-penalty');
      }

      if (context.completedScenarioIds?.includes(scenario.id) && scenario.tags.includes('one-shot')) {
        weight = 0;
        reasons.push('one-shot-completed');
      }

      return { scenario, weight, reasons };
    })
    .filter((candidate) => candidate.weight > 0);
};

export const selectScenario = (
  context: ScenarioSelectionContext,
): WeightedScenarioCandidate | undefined => {
  const candidates = buildScenarioCandidates(context);
  if (candidates.length === 0) return undefined;

  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  if (totalWeight <= 0) return undefined;

  const key = [
    context.seed,
    context.selectionIndex,
    context.locationId,
    context.life.profile.chapterId,
    context.life.profile.chapterUnit,
  ].join('|');
  let cursor = stableHash01(key) * totalWeight;

  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor <= 0) return candidate;
  }

  return candidates[candidates.length - 1];
};
