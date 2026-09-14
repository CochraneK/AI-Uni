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
  careerStages?: CareerStage[];
  developmentalTasks?: DevelopmentalTaskId[];
  relationshipTypes?: RelationshipType[];
  minimumAge?: number;
  maximumAge?: number;
};

export type ScenarioDefinition = {
  id: string;
  title: string;
  packId: string;
  location: WorldLocationId;
  ordinaryGoal: string;
  setup: string;
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
