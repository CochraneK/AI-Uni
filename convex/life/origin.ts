import { seededUnitInterval, selectWeightedLifeOption } from './influence';
import { p003DefaultPopulationPriors } from './p003PopulationPriors';
import type {
  EcologicalContextSnapshot,
  FamilySystemSnapshot,
  LifeOriginHouseholdStructure,
  LifeOriginRegionType,
  LifeOriginSnapshot,
  RelationshipSnapshot,
} from './types';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const scaled = (seed: string, key: string, min: number, max: number) =>
  min + seededUnitInterval(`${seed}:${key}`) * (max - min);

const weightedPick = <T>(
  seed: string,
  key: string,
  options: [{ value: T; weight: number }, ...Array<{ value: T; weight: number }>],
): T => selectWeightedLifeOption(options, `${seed}:${key}`) ?? options[0].value;

export const generateLifeOrigin = (seed: string, birthYear = 2000): LifeOriginSnapshot => {
  const priors = p003DefaultPopulationPriors;

  const regionType = weightedPick<LifeOriginRegionType>(
    seed,
    'region',
    priors.region as [
      { value: LifeOriginRegionType; weight: number },
      ...Array<{ value: LifeOriginRegionType; weight: number }>,
    ],
  );

  const householdStructure = weightedPick<LifeOriginHouseholdStructure>(
    seed,
    'household',
    priors.householdStructure as [
      { value: LifeOriginHouseholdStructure; weight: number },
      ...Array<{ value: LifeOriginHouseholdStructure; weight: number }>,
    ],
  );

  const materialBand = weightedPick(
    seed,
    'material-band',
    priors.materialBands as [
      { value: number; weight: number },
      ...Array<{ value: number; weight: number }>,
    ],
  ) ?? 0.5;

  const regionOpportunity = {
    urban_core: 0.72,
    urban_periphery: 0.6,
    town: 0.48,
    rural: 0.4,
  }[regionType];

  const caregiverCount =
    householdStructure === 'single_caregiver'
      ? 1
      : householdStructure === 'multigenerational'
        ? 3
        : 2;

  // Material resources, care stability and support density are deliberately generated
  // independently. A one-caregiver or low-income household is not treated as a proxy
  // for poor care, and a wealthy household is not treated as automatically supportive.
  const householdMaterialSecurity = clamp01(
    materialBand + scaled(seed, 'material-jitter', -0.1, 0.1),
  );
  const caregivingStability = clamp01(scaled(seed, 'care-stability', 0.28, 0.9));
  const familySupportDensity = clamp01(scaled(seed, 'support-density', 0.25, 0.9));
  const learningAccess = clamp01(
    householdMaterialSecurity * 0.35 +
      regionOpportunity * 0.35 +
      scaled(seed, 'learning-access', 0.08, 0.35),
  );
  const neighborhoodOpportunity = clamp01(
    regionOpportunity * 0.65 + scaled(seed, 'neighborhood', 0.05, 0.35),
  );

  const contextTags = [
    `origin-priors:${priors.id}@${priors.version}`,
    `region:${regionType}`,
    `household:${householdStructure}`,
    householdMaterialSecurity < 0.35 ? 'material_constraint' : 'material_buffer',
    caregivingStability < 0.4 ? 'care_routine_variable' : 'care_routine_stable',
    familySupportDensity > 0.65 ? 'extended_support_available' : 'support_network_limited',
  ];

  return {
    seed,
    birthYear,
    regionType,
    householdStructure,
    caregiverCount,
    householdMaterialSecurity,
    caregivingStability,
    learningAccess,
    neighborhoodOpportunity,
    familySupportDensity,
    contextTags,
  };
};

export const familySystemFromOrigin = (origin: LifeOriginSnapshot): FamilySystemSnapshot => ({
  dimensions: {
    communication_openness: scaled(origin.seed, 'family-communication', 0.25, 0.82),
    emotional_expression: scaled(origin.seed, 'family-expression', 0.22, 0.82),
    autonomy_support: scaled(origin.seed, 'family-autonomy', 0.22, 0.82),
    psychological_control: scaled(origin.seed, 'family-control', 0.08, 0.68),
    achievement_pressure: scaled(origin.seed, 'family-achievement', 0.12, 0.78),
    boundary_flexibility: scaled(origin.seed, 'family-boundary', 0.24, 0.82),
    conflict_repair: scaled(origin.seed, 'family-repair', 0.2, 0.82),
    caregiving_reliability: origin.caregivingStability,
    financial_security: origin.householdMaterialSecurity,
    intergenerational_closeness: clamp01(
      origin.familySupportDensity * 0.55 + scaled(origin.seed, 'intergenerational', 0.1, 0.42),
    ),
  },
  activePatterns: [],
  protectiveFactors: [
    ...(origin.caregivingStability > 0.65 ? ['stable_care_routine'] : []),
    ...(origin.familySupportDensity > 0.65 ? ['extended_support'] : []),
    ...(origin.neighborhoodOpportunity > 0.65 ? ['neighborhood_opportunity'] : []),
  ],
  stressors: [
    ...(origin.householdMaterialSecurity < 0.35 ? ['material_constraint'] : []),
    ...(origin.caregivingStability < 0.4 ? ['care_routine_instability'] : []),
  ],
});

export const ecologyFromOrigin = (origin: LifeOriginSnapshot): EcologicalContextSnapshot[] => [
  {
    system: 'microsystem',
    key: 'family_home',
    description: '出生后最直接的家庭、照护与日常生活环境。',
    opportunity: clamp01(
      origin.caregivingStability * 0.45 + origin.familySupportDensity * 0.35 + 0.15,
    ),
    stress: clamp01(
      0.65 - origin.caregivingStability * 0.3 - origin.householdMaterialSecurity * 0.2,
    ),
    stability: origin.caregivingStability,
  },
  {
    system: 'microsystem',
    key: 'neighborhood',
    description: '居住地周边的活动空间、同伴、公共服务与可接触资源。',
    opportunity: origin.neighborhoodOpportunity,
    stress: clamp01(0.55 - origin.neighborhoodOpportunity * 0.35),
    stability: scaled(origin.seed, 'neighborhood-stability', 0.35, 0.82),
  },
  {
    system: 'exosystem',
    key: 'household_resources',
    description: '照护者工作、收入与时间安排形成的家庭机会结构。',
    opportunity: origin.householdMaterialSecurity,
    stress: clamp01(0.72 - origin.householdMaterialSecurity * 0.55),
    stability: scaled(origin.seed, 'resource-stability', 0.32, 0.82),
  },
  {
    system: 'chronosystem',
    key: 'birth_cohort',
    description: `出生于 ${origin.birthYear} 年附近的时代背景；后续宏观事件会沿时间线加入。`,
    opportunity: 0.5,
    stress: 0.2,
    stability: 0.35,
  },
];

export const caregiverRelationshipFromOrigin = (
  origin: LifeOriginSnapshot,
  personKey = 'primary_caregiver',
): RelationshipSnapshot => ({
  personKey,
  relationshipType: 'caregiver',
  dimensions: {
    trust: clamp01(0.3 + origin.caregivingStability * 0.55),
    closeness: clamp01(0.25 + origin.caregivingStability * 0.5),
    reciprocity: 0.15,
    reliability: origin.caregivingStability,
    conflict_repair: scaled(origin.seed, 'caregiver-repair', 0.25, 0.78),
    comfort_with_dependence: clamp01(0.3 + origin.caregivingStability * 0.55),
    fear_of_rejection: scaled(origin.seed, 'caregiver-rejection', 0.12, 0.48),
    reassurance_seeking: 0.4,
    withdrawal: scaled(origin.seed, 'caregiver-withdrawal', 0.08, 0.38),
    boundary_clarity: 0.25,
  },
  sharedHistory: ['birth'],
  unresolvedIssues: [],
});
