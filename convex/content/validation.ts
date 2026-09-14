import { constructRegistry } from '../assessment/constructs';
import {
  UNIVERSITY_DAY_END_MINUTE,
  UNIVERSITY_DAY_START_MINUTE,
} from '../life/dayClock';
import { worldLocations } from '../world/locations';
import type { ContentPack } from './types';

export type ContentValidationIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  packId?: string;
  scenarioId?: string;
};

export const validateContentPacks = (packs: ContentPack[]): ContentValidationIssue[] => {
  const issues: ContentValidationIssue[] = [];
  const scenarioIds = new Set<string>();
  const packIds = new Set<string>();
  const playableDayMinutes = UNIVERSITY_DAY_END_MINUTE - UNIVERSITY_DAY_START_MINUTE;

  for (const pack of packs) {
    if (packIds.has(pack.id)) {
      issues.push({
        level: 'error',
        code: 'duplicate_pack_id',
        message: `Duplicate content pack id: ${pack.id}`,
        packId: pack.id,
      });
    }
    packIds.add(pack.id);

    for (const scenario of pack.scenarios) {
      if (scenario.packId !== pack.id) {
        issues.push({
          level: 'error',
          code: 'pack_id_mismatch',
          message: `Scenario ${scenario.id} declares packId ${scenario.packId} but is inside ${pack.id}.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      if (scenarioIds.has(scenario.id)) {
        issues.push({
          level: 'error',
          code: 'duplicate_scenario_id',
          message: `Duplicate scenario id: ${scenario.id}`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }
      scenarioIds.add(scenario.id);

      if (!worldLocations[scenario.location]) {
        issues.push({
          level: 'error',
          code: 'unknown_location',
          message: `Unknown location ${scenario.location} in ${scenario.id}.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      if (
        !Number.isInteger(scenario.estimatedMinutes) ||
        scenario.estimatedMinutes <= 0 ||
        scenario.estimatedMinutes > playableDayMinutes
      ) {
        issues.push({
          level: 'error',
          code: 'invalid_estimated_minutes',
          message: `${scenario.id} estimatedMinutes must be a positive integer no longer than one playable day (${playableDayMinutes} minutes).`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      const firstWeekDays = scenario.lifeContext?.firstWeekDays;
      if (firstWeekDays) {
        if (firstWeekDays.length === 0) {
          issues.push({
            level: 'error',
            code: 'empty_first_week_window',
            message: `${scenario.id} declares an empty firstWeekDays window.`,
            packId: pack.id,
            scenarioId: scenario.id,
          });
        }
        const invalidDays = firstWeekDays.filter(
          (day) => !Number.isInteger(day) || day < 1 || day > 7,
        );
        if (invalidDays.length > 0) {
          issues.push({
            level: 'error',
            code: 'invalid_first_week_day',
            message: `${scenario.id} has invalid firstWeekDays: ${invalidDays.join(', ')}. Expected integers 1..7.`,
            packId: pack.id,
            scenarioId: scenario.id,
          });
        }
        if (new Set(firstWeekDays).size !== firstWeekDays.length) {
          issues.push({
            level: 'error',
            code: 'duplicate_first_week_day',
            message: `${scenario.id} repeats a value in firstWeekDays.`,
            packId: pack.id,
            scenarioId: scenario.id,
          });
        }
      }

      const chapterUnits = scenario.lifeContext?.chapterUnits;
      if (chapterUnits?.some((unit) => !Number.isInteger(unit) || unit < 1)) {
        issues.push({
          level: 'error',
          code: 'invalid_chapter_unit',
          message: `${scenario.id} chapterUnits must contain positive integers.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      for (const target of scenario.hiddenTargets) {
        if (!constructRegistry[target]) {
          issues.push({
            level: 'error',
            code: 'unknown_construct',
            message: `Unknown construct ${target} in ${scenario.id}.`,
            packId: pack.id,
            scenarioId: scenario.id,
          });
        }
      }

      if (scenario.researchUse === 'none' && scenario.hiddenTargets.length > 0) {
        issues.push({
          level: 'error',
          code: 'pure_life_has_hidden_targets',
          message: `${scenario.id} is pure-life content and must not declare hidden assessment targets.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      if (scenario.safetyLevel === 'sensitive' && scenario.enabledByDefault) {
        issues.push({
          level: 'error',
          code: 'sensitive_enabled_by_default',
          message: `Sensitive scenario ${scenario.id} must be opt-in.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      const includesClinicalExploration = scenario.hiddenTargets.some(
        (target) => target.startsWith('cape.') || target.startsWith('pcl5_associated.'),
      );
      if (includesClinicalExploration && scenario.researchUse !== 'exploratory_only') {
        issues.push({
          level: 'error',
          code: 'clinical_construct_not_exploratory',
          message: `${scenario.id} includes CAPE/PCL-associated targets and must use exploratory_only.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }

      if (scenario.observableFeatures.length === 0 && scenario.researchUse !== 'none') {
        issues.push({
          level: 'warning',
          code: 'no_observable_features',
          message: `${scenario.id} has no observable features.`,
          packId: pack.id,
          scenarioId: scenario.id,
        });
      }
    }
  }

  return issues;
};

export const assertValidContentPacks = (packs: ContentPack[]) => {
  const errors = validateContentPacks(packs).filter((issue) => issue.level === 'error');
  if (errors.length > 0) {
    throw new Error(`Invalid content packs:\n${errors.map((issue) => `- ${issue.message}`).join('\n')}`);
  }
};
