import type { LifeOriginSnapshot, LifeProfileSnapshot } from './types';

export const createP003LifeProfileSnapshot = (
  origin: LifeOriginSnapshot,
): LifeProfileSnapshot => ({
  universityProfileId: 'generic_university',
  origin,
  age: 0,
  season: 'origin',
  lifeStage: 'infancy_foundations',
  chapterId: 'birth_and_family',
  chapterUnit: 1,
  totalGameDays: 0,
  academicYear: 'none',
  careerStage: 'not_applicable',
  identityState: {
    education: 0,
    career: 0,
    relationships: 0.15,
    family: 0.4,
    community: 0,
    values: 0,
    competence: 0.05,
    lifestyle: 0,
  },
  currentStressLoad: 0.08,
  perceivedSupport: origin.familySupportDensity,
  recoveryCapacity: Math.max(0.2, Math.min(0.85, 0.25 + origin.caregivingStability * 0.55)),
  meaningOrientation: 0,
  resources: {
    physicalEnergy: 0.72,
    healthCapacity: 0.7,
    householdMaterialSecurity: origin.householdMaterialSecurity,
    timeAutonomy: 0.02,
    socialSupport: origin.familySupportDensity,
    learningOpportunity: origin.learningAccess,
  },
  needs: {
    autonomy: 0.08,
    competence: 0.05,
    relatedness: 0.72,
  },
});

export const p003StatePrinciples = [
  'Visible meters describe the current game situation, not the player\'s worth.',
  'Stable tendencies should move slowly; current mood, stress and energy can move quickly.',
  'Life history is stored as events and relationship history rather than compressed into one score.',
  'Childhood changes later probabilities and available scripts but never hard-locks adult outcomes.',
  'Structural resources and historical context must influence opportunities beside personal choices.',
  'University, marriage, parenthood and conventional careers are optional branches.',
] as const;
