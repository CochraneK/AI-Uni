import type { ConstructId } from '../assessment/constructs';
import type {
  ScenarioDefinition,
  ScenarioSafetyLevel,
  ResearchUse,
} from '../content/types';

// Backward-compatible aliases while scenario code migrates to the content-pack system.
export type AssessmentTarget = ConstructId;
export type CampusScenario = ScenarioDefinition;
export type { ScenarioSafetyLevel, ResearchUse };
