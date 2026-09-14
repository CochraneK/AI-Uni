export type InfluenceSource =
  | 'person'
  | 'relationship'
  | 'family'
  | 'social_network'
  | 'ecology'
  | 'life_history'
  | 'current_state'
  | 'random_context';

export type InfluenceFactor = {
  key: string;
  source: InfluenceSource;
  direction: -1 | 1;
  strength: number;
  confidence: number;
  reason: string;
};

export type ProbabilityInfluenceResult = {
  baseProbability: number;
  probability: number;
  rawShift: number;
  appliedShift: number;
  factors: InfluenceFactor[];
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const normalizeInfluenceFactor = (factor: InfluenceFactor): InfluenceFactor => ({
  ...factor,
  strength: clamp01(factor.strength),
  confidence: clamp01(factor.confidence),
});

/**
 * Combines life-course influences into a bounded probability shift.
 *
 * This is a gameplay/event-selection utility, not a psychometric model. The cap is
 * intentional: no family pattern, attachment-like signal, trait, stressor or past
 * event should deterministically force a future outcome.
 */
export const applyBoundedInfluences = (
  baseProbability: number,
  factors: InfluenceFactor[],
  options: { maxAbsoluteShift?: number; factorScale?: number } = {},
): ProbabilityInfluenceResult => {
  const base = clamp01(baseProbability);
  const maxAbsoluteShift = Math.max(0, Math.min(0.49, options.maxAbsoluteShift ?? 0.3));
  const factorScale = Math.max(0, Math.min(0.25, options.factorScale ?? 0.08));
  const normalized = factors.map(normalizeInfluenceFactor);

  const rawShift = normalized.reduce(
    (sum, factor) => sum + factor.direction * factor.strength * factor.confidence * factorScale,
    0,
  );
  const appliedShift = Math.max(-maxAbsoluteShift, Math.min(maxAbsoluteShift, rawShift));

  return {
    baseProbability: base,
    probability: clamp01(base + appliedShift),
    rawShift,
    appliedShift,
    factors: normalized,
  };
};

export type WeightedLifeOption<T> = {
  value: T;
  weight: number;
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const seededUnitInterval = (seed: string) => hashString(seed) / 0xffffffff;

/** Deterministic weighted selection for reproducible study/game runs. */
export const selectWeightedLifeOption = <T>(
  options: WeightedLifeOption<T>[],
  seed: string,
): T | undefined => {
  const usable = options
    .map((option) => ({ ...option, weight: Math.max(0, option.weight) }))
    .filter((option) => option.weight > 0);
  if (usable.length === 0) return undefined;

  const total = usable.reduce((sum, option) => sum + option.weight, 0);
  let cursor = seededUnitInterval(seed) * total;
  for (const option of usable) {
    cursor -= option.weight;
    if (cursor <= 0) return option.value;
  }
  return usable[usable.length - 1]?.value;
};

export const influenceBoundaries = {
  defaultMaxAbsoluteShift: 0.3,
  principles: [
    'Use several contextual factors rather than one label.',
    'Protective factors can offset risk factors.',
    'Past experience may change probabilities but must not force an outcome.',
    'Structural/ecological factors belong beside personal factors.',
    'Keep study calibration models separate from gameplay event probabilities.',
  ],
} as const;
