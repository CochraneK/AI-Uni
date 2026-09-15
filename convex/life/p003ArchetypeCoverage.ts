import { p003NarrativeArchetypes } from './p003Archetypes';
import type { RelationshipType } from './types';

export type P003ArchetypeCoverageRow = {
  role: RelationshipType;
  archetypeCount: number;
  archetypeKeys: string[];
  valueCount: number;
  pressureVariantCount: number;
  strategyVariantCount: number;
  needVariantCount: number;
  status: 'covered' | 'thin' | 'missing';
};

const roles: RelationshipType[] = [
  'caregiver',
  'parent',
  'grandparent',
  'sibling',
  'peer',
  'friend',
  'close_friend',
  'romantic_partner',
  'spouse',
  'child',
  'teacher',
  'mentor',
  'coworker',
  'manager',
  'community',
];

export const buildP003ArchetypeCoverage = (): P003ArchetypeCoverageRow[] =>
  roles.map((role) => {
    const matching = p003NarrativeArchetypes.filter((archetype) =>
      archetype.roleAffinities.includes(role),
    );
    const values = new Set(matching.flatMap((item) => item.valueAffinities));
    const pressures = new Set(matching.flatMap((item) => item.formativePressures));
    const strategies = new Set(matching.flatMap((item) => item.compensatoryStrategies));
    const needs = new Set(matching.flatMap((item) => item.developmentalNeeds));

    return {
      role,
      archetypeCount: matching.length,
      archetypeKeys: matching.map((item) => item.key),
      valueCount: values.size,
      pressureVariantCount: pressures.size,
      strategyVariantCount: strategies.size,
      needVariantCount: needs.size,
      status:
        matching.length === 0
          ? 'missing'
          : matching.length < 2 || pressures.size < 4 || strategies.size < 4 || needs.size < 4
            ? 'thin'
            : 'covered',
    };
  });

export const validateP003ArchetypeGrid = (): string[] => {
  const issues: string[] = [];
  const keys = p003NarrativeArchetypes.map((item) => item.key);
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
  if (duplicateKeys.length > 0) {
    issues.push(`Duplicate archetype keys: ${[...new Set(duplicateKeys)].join(', ')}`);
  }

  for (const archetype of p003NarrativeArchetypes) {
    if (archetype.formativePressures.length < 2) {
      issues.push(`${archetype.key}: too few formative pressures`);
    }
    if (archetype.compensatoryStrategies.length < 2) {
      issues.push(`${archetype.key}: too few compensatory strategies`);
    }
    if (archetype.developmentalNeeds.length < 2) {
      issues.push(`${archetype.key}: too few developmental needs`);
    }
    if (archetype.coreDesires.length < 1 || archetype.coreFears.length < 1) {
      issues.push(`${archetype.key}: missing desire/fear variants`);
    }
    if (archetype.arcQuestions.length < 1) {
      issues.push(`${archetype.key}: missing arc question`);
    }
  }

  return issues;
};

export const p003ArchetypeCoveragePrinciple =
  'Deep character diversity is audited by archetype, role and variant pools instead of claiming diversity from the raw Cartesian product of surface fields.';
