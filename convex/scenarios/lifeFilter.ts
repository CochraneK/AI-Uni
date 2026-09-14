import type { ScenarioDefinition } from '../content/types';
import type { LifeProfileSnapshot, RelationshipType } from '../life/types';

export type ScenarioLifeRuntimeContext = {
  profile: LifeProfileSnapshot;
  activeDevelopmentalTasks?: string[];
  availableRelationshipTypes?: RelationshipType[];
};

export const scenarioMatchesLifeContext = (
  scenario: ScenarioDefinition,
  context: ScenarioLifeRuntimeContext,
): boolean => {
  const rule = scenario.lifeContext;
  if (!rule) return true;

  const { profile } = context;

  if (rule.seasons && !rule.seasons.includes(profile.season)) return false;
  if (rule.chapterIds && !rule.chapterIds.includes(profile.chapterId)) return false;
  if (rule.chapterUnits && !rule.chapterUnits.includes(profile.chapterUnit)) return false;
  if (
    profile.chapterId === 'university_first_week' &&
    rule.firstWeekDays &&
    !rule.firstWeekDays.includes(profile.chapterUnit)
  ) {
    return false;
  }
  if (rule.careerStages && !rule.careerStages.includes(profile.careerStage)) return false;
  if (rule.minimumAge !== undefined && profile.age < rule.minimumAge) return false;
  if (rule.maximumAge !== undefined && profile.age > rule.maximumAge) return false;

  if (
    rule.developmentalTasks &&
    !rule.developmentalTasks.some((task) => context.activeDevelopmentalTasks?.includes(task))
  ) {
    return false;
  }

  if (
    rule.relationshipTypes &&
    !rule.relationshipTypes.some((type) => context.availableRelationshipTypes?.includes(type))
  ) {
    return false;
  }

  return true;
};

export const filterScenariosForLifeContext = (
  scenarios: ScenarioDefinition[],
  context: ScenarioLifeRuntimeContext,
) => scenarios.filter((scenario) => scenarioMatchesLifeContext(scenario, context));
