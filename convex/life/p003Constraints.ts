import { p003LifeDomains } from './p003Ontology';
import { p003ResearchOnlyConstructs } from './p003PsychologyRegistry';
import type { P003Storylet } from './p003Storylets';

export type P003ConstraintSeverity = 'error' | 'warning' | 'note';

export type P003ConstraintIssue = {
  storyletId: string;
  severity: P003ConstraintSeverity;
  rule: string;
  message: string;
};

const researchOnlyIds = new Set(
  p003ResearchOnlyConstructs.map((policy) => policy.constructId),
);

const minAgeForRoles: Partial<Record<string, number>> = {
  manager: 16,
  coworker: 14,
  partner: 12,
  spouse: 16,
  child: 12,
};

export const auditP003StoryletConstraints = (
  storylet: P003Storylet,
): P003ConstraintIssue[] => {
  const issues: P003ConstraintIssue[] = [];
  const [minAge, maxAge] = storylet.prerequisites.ageRange;

  if (!p003LifeDomains[storylet.primaryDomain]) {
    issues.push({
      storyletId: storylet.id,
      severity: 'error',
      rule: 'known-primary-domain',
      message: 'Primary life domain is not registered in the P003 ontology.',
    });
  }

  if (storylet.choices.length < 2) {
    issues.push({
      storyletId: storylet.id,
      severity: 'warning',
      rule: 'meaningful-choice',
      message: 'Interactive Storylets should normally offer at least two materially different choices.',
    });
  }

  if (storylet.pressureShapes.length === 0) {
    issues.push({
      storyletId: storylet.id,
      severity: 'error',
      rule: 'pressure-shape-required',
      message: 'Every Storylet needs at least one event pressure/affordance shape.',
    });
  }

  for (const role of storylet.castSlots) {
    const ageFloor = minAgeForRoles[role];
    if (ageFloor !== undefined && maxAge < ageFloor) {
      issues.push({
        storyletId: storylet.id,
        severity: 'warning',
        rule: 'role-age-plausibility',
        message: `Role "${role}" is unusual when the player is at most ${maxAge} years old; confirm this is intentional.`,
      });
    }
  }

  if (storylet.primaryDomain === 'work_career' && maxAge < 14) {
    issues.push({
      storyletId: storylet.id,
      severity: 'warning',
      rule: 'domain-age-plausibility',
      message: 'A work/career primary-domain Storylet before age 14 requires explicit historical/context justification.',
    });
  }

  if (storylet.primaryDomain === 'intimacy' && maxAge < 12) {
    issues.push({
      storyletId: storylet.id,
      severity: 'warning',
      rule: 'domain-age-plausibility',
      message: 'An intimacy primary-domain Storylet before adolescence is probably misclassified.',
    });
  }

  if (
    storylet.narrativeFunction === 'loss' &&
    !storylet.pressureShapes.includes('loss')
  ) {
    issues.push({
      storyletId: storylet.id,
      severity: 'warning',
      rule: 'narrative-pressure-alignment',
      message: 'A loss-function Storylet should usually include the loss pressure shape.',
    });
  }

  if (
    storylet.narrativeFunction === 'opportunity' &&
    !storylet.pressureShapes.includes('opportunity')
  ) {
    issues.push({
      storyletId: storylet.id,
      severity: 'note',
      rule: 'narrative-pressure-alignment',
      message: 'Consider adding the opportunity pressure shape to an opportunity-function Storylet.',
    });
  }

  const researchOnlySignals = new Set(
    storylet.choices.flatMap((choice) =>
      choice.analysisSignalIds.filter((id) => researchOnlyIds.has(id as never)),
    ),
  );

  if (researchOnlySignals.size > 0 && !storylet.packId.startsWith('research-')) {
    issues.push({
      storyletId: storylet.id,
      severity: 'error',
      rule: 'research-only-boundary',
      message:
        'CAPE/PCL-associated research-only signals may only be authored in an explicitly research-designated content pack.',
    });
  }

  if (minAge < 0 || maxAge > 100 || minAge > maxAge) {
    issues.push({
      storyletId: storylet.id,
      severity: 'error',
      rule: 'age-range-validity',
      message: `Invalid age range [${minAge}, ${maxAge}].`,
    });
  }

  const duplicateChoiceIds = storylet.choices
    .map((choice) => choice.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicateChoiceIds.length > 0) {
    issues.push({
      storyletId: storylet.id,
      severity: 'error',
      rule: 'choice-id-uniqueness',
      message: `Duplicate choice ids: ${[...new Set(duplicateChoiceIds)].join(', ')}.`,
    });
  }

  return issues;
};

export const auditP003CatalogConstraints = (
  storylets: P003Storylet[],
): P003ConstraintIssue[] =>
  storylets.flatMap(auditP003StoryletConstraints);

export const p003CrossConstraintPrinciples = [
  'Borrowed from AI-persona engineering: dimensions should not be sampled independently when they imply incompatible states.',
  'P003 constraints protect developmental, narrative and research-boundary coherence; they do not make deterministic claims about what kind of person can have a given life.',
  'Soft population tendencies belong in weighted sampling with explicit provenance; impossible combinations belong in hard validation.',
  'Atypical lives are allowed. Warnings ask authors for justification rather than silently deleting rare trajectories.',
] as const;
