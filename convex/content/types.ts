import type { ConstructId } from '../assessment/constructs';
import type { WorldLocationId } from '../world/locations';

export type ScenarioSafetyLevel = 'ordinary' | 'mild_stress' | 'sensitive';
export type ResearchUse = 'behavioral_feature' | 'exploratory_only';

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
