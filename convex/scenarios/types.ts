import type { CampusLocationId } from '../campus/config';

export type AssessmentTarget =
  | `big5.${'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'}`
  | `cape.${'persecutory_ideation' | 'bizarre_experiences' | 'perceptual_abnormalities'}`
  | `pcl5_associated.${'intrusion' | 'avoidance' | 'negative_mood_cognition' | 'arousal_reactivity'}`;

export type ScenarioSafetyLevel = 'ordinary' | 'mild_stress' | 'sensitive';

export type CampusScenario = {
  id: string;
  title: string;
  location: CampusLocationId;
  ordinaryGoal: string;
  setup: string;
  npcRoles: string[];
  hiddenTargets: AssessmentTarget[];
  safetyLevel: ScenarioSafetyLevel;
  researchUse: 'behavioral_feature' | 'exploratory_only';
  observableFeatures: string[];
};
