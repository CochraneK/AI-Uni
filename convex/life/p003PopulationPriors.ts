import type {
  LifeOriginHouseholdStructure,
  LifeOriginRegionType,
} from './types';

export type P003WeightedOption<T> = {
  value: T;
  weight: number;
};

export type P003PopulationPriorSet = {
  id: string;
  version: number;
  label: string;
  sourceNote: string;
  representativeClaim: boolean;
  applicableBirthYears?: [number, number];
  region: Array<P003WeightedOption<LifeOriginRegionType>>;
  householdStructure: Array<P003WeightedOption<LifeOriginHouseholdStructure>>;
  materialBands: Array<P003WeightedOption<number>>;
};

export const p003DefaultPopulationPriors: P003PopulationPriorSet = {
  id: 'p003-gameplay-placeholder',
  version: 1,
  label: 'P003 gameplay placeholder priors',
  sourceNote:
    'Migrated from the original P003 hand-authored origin generator. These weights exist to create varied playthroughs and must not be presented as population-representative statistics.',
  representativeClaim: false,
  region: [
    { value: 'urban_core', weight: 0.28 },
    { value: 'urban_periphery', weight: 0.28 },
    { value: 'town', weight: 0.24 },
    { value: 'rural', weight: 0.2 },
  ],
  householdStructure: [
    { value: 'two_caregiver', weight: 0.55 },
    { value: 'single_caregiver', weight: 0.14 },
    { value: 'multigenerational', weight: 0.23 },
    { value: 'blended_or_other', weight: 0.08 },
  ],
  materialBands: [
    { value: 0.22, weight: 0.2 },
    { value: 0.42, weight: 0.34 },
    { value: 0.62, weight: 0.3 },
    { value: 0.82, weight: 0.16 },
  ],
};

export const p003PopulationPriorRegistry: Record<
  string,
  P003PopulationPriorSet
> = {
  [p003DefaultPopulationPriors.id]: p003DefaultPopulationPriors,
};

export const validateP003PopulationPriors = (
  priors: P003PopulationPriorSet,
): string[] => {
  const issues: string[] = [];
  const groups: Array<[string, Array<P003WeightedOption<unknown>>]> = [
    ['region', priors.region],
    ['householdStructure', priors.householdStructure],
    ['materialBands', priors.materialBands],
  ];
  for (const [name, options] of groups) {
    if (options.length === 0) issues.push(`${name} must not be empty`);
    if (options.some((option) => !Number.isFinite(option.weight) || option.weight <= 0)) {
      issues.push(`${name} contains a non-positive or invalid weight`);
    }
  }
  if (!priors.sourceNote.trim()) issues.push('sourceNote must describe provenance');
  return issues;
};

export const p003PopulationPriorPrinciples = [
  'Borrowed from AI-persona stratification: sampling priors live in a dedicated, versioned module rather than being scattered across generators.',
  'Every empirical-looking distribution needs provenance, scope and a representativeClaim flag.',
  'Mental-health status must not silently determine gender, education, class or occupation in P003 gameplay.',
  'Future cohort/region packs may replace these priors without rewriting the origin generator.',
] as const;
