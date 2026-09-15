import type { P003PressureShapeId } from './p003PressureShapes';
import type { P003Storylet } from './p003Storylets';

export type P003EventImpactProfile = {
  disruption: number;
  uncontrollability: number;
  socialExposure: number;
  duration: number;
  resourceCost: number;
  reversibility: number;
  source: 'pressure_shape_prior' | 'authored_override';
};

type ImpactVector = Omit<P003EventImpactProfile, 'source'>;

const zero: ImpactVector = {
  disruption: 0,
  uncontrollability: 0,
  socialExposure: 0,
  duration: 0,
  resourceCost: 0,
  reversibility: 1,
};

const shapeImpact: Record<P003PressureShapeId, ImpactVector> = {
  loss: {
    disruption: 0.8,
    uncontrollability: 0.7,
    socialExposure: 0.35,
    duration: 0.75,
    resourceCost: 0.45,
    reversibility: 0.2,
  },
  danger: {
    disruption: 0.85,
    uncontrollability: 0.8,
    socialExposure: 0.25,
    duration: 0.45,
    resourceCost: 0.5,
    reversibility: 0.45,
  },
  humiliation: {
    disruption: 0.55,
    uncontrollability: 0.55,
    socialExposure: 0.95,
    duration: 0.45,
    resourceCost: 0.15,
    reversibility: 0.55,
  },
  entrapment: {
    disruption: 0.65,
    uncontrollability: 0.9,
    socialExposure: 0.4,
    duration: 0.9,
    resourceCost: 0.55,
    reversibility: 0.25,
  },
  role_overload: {
    disruption: 0.6,
    uncontrollability: 0.55,
    socialExposure: 0.35,
    duration: 0.7,
    resourceCost: 0.75,
    reversibility: 0.55,
  },
  uncertainty: {
    disruption: 0.45,
    uncontrollability: 0.7,
    socialExposure: 0.25,
    duration: 0.45,
    resourceCost: 0.25,
    reversibility: 0.75,
  },
  conflict: {
    disruption: 0.5,
    uncontrollability: 0.45,
    socialExposure: 0.55,
    duration: 0.4,
    resourceCost: 0.25,
    reversibility: 0.65,
  },
  belonging: {
    disruption: 0.35,
    uncontrollability: 0.35,
    socialExposure: 0.75,
    duration: 0.55,
    resourceCost: 0.2,
    reversibility: 0.7,
  },
  opportunity: {
    disruption: 0.45,
    uncontrollability: 0.3,
    socialExposure: 0.35,
    duration: 0.5,
    resourceCost: 0.35,
    reversibility: 0.75,
  },
  achievement: {
    disruption: 0.35,
    uncontrollability: 0.25,
    socialExposure: 0.8,
    duration: 0.3,
    resourceCost: 0.25,
    reversibility: 0.8,
  },
  transition: {
    disruption: 0.65,
    uncontrollability: 0.45,
    socialExposure: 0.4,
    duration: 0.65,
    resourceCost: 0.55,
    reversibility: 0.55,
  },
  caregiving: {
    disruption: 0.55,
    uncontrollability: 0.55,
    socialExposure: 0.3,
    duration: 0.8,
    resourceCost: 0.8,
    reversibility: 0.45,
  },
  neutral: zero,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mergeVectors = (vectors: ImpactVector[]): ImpactVector => {
  if (vectors.length === 0) return zero;
  const avg = (key: keyof ImpactVector) =>
    vectors.reduce((sum, vector) => sum + vector[key], 0) / vectors.length;

  return {
    disruption: clamp01(avg('disruption')),
    uncontrollability: clamp01(avg('uncontrollability')),
    socialExposure: clamp01(avg('socialExposure')),
    duration: clamp01(avg('duration')),
    resourceCost: clamp01(avg('resourceCost')),
    reversibility: clamp01(avg('reversibility')),
  };
};

export const inferP003EventImpact = (
  storylet: Pick<P003Storylet, 'pressureShapes'>,
): P003EventImpactProfile => ({
  ...mergeVectors(storylet.pressureShapes.map((shape) => shapeImpact[shape])),
  source: 'pressure_shape_prior',
});

export const p003EventImpactPrinciples = [
  'Adapted from AI-persona event-load thinking, but P003 does not use LCU totals or ACE dose-response as a clinical-risk score.',
  'Impact dimensions describe how disruptive an event is to the game world, not how much psychological damage it must cause.',
  'The same event load can produce different outcomes depending on resources, relationships, history and player choices.',
  'Reversibility is modeled separately from disruption so a dramatic event is not automatically permanent.',
] as const;
