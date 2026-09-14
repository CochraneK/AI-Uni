import type { ConstructId } from '../assessment/constructs';
import type {
  CareerStage,
  DevelopmentalTaskId,
  LifeSeasonId,
  RelationshipType,
} from '../life/types';
import type { WorldLocationId } from '../world/locations';

export type ScenarioSafetyLevel = 'ordinary' | 'mild_stress' | 'sensitive';
export type ResearchUse = 'none' | 'behavioral_feature' | 'exploratory_only';

export type ScenarioLifeContext = {
  seasons?: LifeSeasonId[];
  chapterIds?: string[];
  chapterUnits?: number[];
  /** Only restricts the seven-day opening chapter. Ignored in later chapters. */
  firstWeekDays?: number[];
  careerStages?: CareerStage[];
  developmentalTasks?: DevelopmentalTaskId[];
  relationshipTypes?: RelationshipType[];
  minimumAge?: number;
  maximumAge?: number;
};

export type ScenarioTimeWindow = {
  /** Inclusive authored start in local game-clock HH:MM form. */
  start: string;
  /** Latest allowed completion time in local game-clock HH:MM form. */
  end: string;
  /** Optional player-facing/editorial note such as breakfast or evening. */
  label?: string;
};

export type ScenarioDefinition = {
  id: string;
  title: string;
  packId: string;
  location: WorldLocationId;
  ordinaryGoal: string;
  setup: string;
  /**
   * Narrative time block reserved when the scene is completed. This is authored
   * explicitly from the ordinary-life fiction; it must never be inferred from
   * safetyLevel, researchUse or hidden psychological targets.
   */
  estimatedMinutes: number;
  /**
   * Optional ordinary-life clock windows. A new scene may start only when its
   * full estimated duration can finish inside at least one window.
   */
  timeWindows?: ScenarioTimeWindow[];
  npcRoles: string[];
  hiddenTargets: ConstructId[];
  safetyLevel: ScenarioSafetyLevel;
  researchUse: ResearchUse;
  observableFeatures: string[];
  tags: string[];
  enabledByDefault: boolean;
  lifeContext?: ScenarioLifeContext;
};

export type ContentPack = {
  id: string;
  title: string;
  description: string;
  scope: 'campus' | 'city' | 'mixed';
  status: 'enabled' | 'planned';
  scenarios: ScenarioDefinition[];
};

export const defineContentPack = <T extends ContentPack>(pack: T) => pack;
