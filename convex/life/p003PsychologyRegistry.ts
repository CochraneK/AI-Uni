import {
  constructRegistry,
  type ConstructDomain,
  type ConstructId,
} from '../assessment/constructs';

export type P003PsychologySurface = 'profile' | 'reflection' | 'research_only';
export type P003GameScoreMode =
  | 'behavioral_evidence'
  | 'relationship_specific_evidence'
  | 'research_association_only';

export type P003PsychologyPolicy = {
  constructId: ConstructId;
  sourceDomain: ConstructDomain;
  label: string;
  surface: P003PsychologySurface;
  gameScoreMode: P003GameScoreMode;
  userVisible: boolean;
  minimumEvidence: number;
  minimumDistinctContexts: number;
  minimumLifeStages: number;
  relationshipSpecific: boolean;
  requiresIndependentCriterion: boolean;
  interpretationBoundary: string;
};

const policyFor = (constructId: ConstructId): P003PsychologyPolicy => {
  const construct = constructRegistry[constructId];
  const isClinicalResearch =
    construct.domain === 'psychosis_like_experience' ||
    construct.domain === 'trauma_associated';
  const isAttachment = construct.domain === 'attachment';
  const isBigFive = construct.domain === 'personality';

  return {
    constructId,
    sourceDomain: construct.domain,
    label: construct.label,
    surface: isClinicalResearch ? 'research_only' : isBigFive ? 'profile' : 'reflection',
    gameScoreMode: isClinicalResearch
      ? 'research_association_only'
      : isAttachment
        ? 'relationship_specific_evidence'
        : 'behavioral_evidence',
    userVisible: !isClinicalResearch,
    minimumEvidence: isClinicalResearch ? 6 : isBigFive ? 4 : 3,
    minimumDistinctContexts: isClinicalResearch ? 4 : isBigFive ? 3 : 2,
    minimumLifeStages: isClinicalResearch ? 2 : isBigFive ? 2 : 1,
    relationshipSpecific: isAttachment,
    requiresIndependentCriterion:
      isClinicalResearch || construct.calibration.includes('独立') || construct.calibration.includes('量表'),
    interpretationBoundary: construct.calibration,
  };
};

export const p003PsychologyRegistry = Object.fromEntries(
  (Object.keys(constructRegistry) as ConstructId[]).map((constructId) => [
    constructId,
    policyFor(constructId),
  ]),
) as Record<ConstructId, P003PsychologyPolicy>;

export const p003UserVisibleConstructs = (Object.values(p003PsychologyRegistry) as P003PsychologyPolicy[])
  .filter((policy) => policy.userVisible);

export const p003ResearchOnlyConstructs = (Object.values(p003PsychologyRegistry) as P003PsychologyPolicy[])
  .filter((policy) => policy.surface === 'research_only');

export const currentP003ReportBridge = {
  'big5.openness': 'big5.openness',
  'big5.conscientiousness': 'big5.conscientiousness',
  'big5.extraversion': 'big5.extraversion',
  'big5.agreeableness': 'big5.agreeableness',
  'big5.neuroticism': 'big5.neuroticism',
  'behavior.support_seeking': 'social.support_seeking',
  'behavior.risk_taking': 'decision.risk_taking',
  'coping.problem_focused': 'coping.problem_focused',
  'coping.emotion_focused': 'coping.emotion_focused',
  'coping.avoidance': 'coping.avoidance',
  'coping.reappraisal': 'emotion.reappraisal',
} as const satisfies Record<string, ConstructId>;

export const p003TheoryDerivedDimensions = {
  'behavior.autonomy': {
    sourceTheory: 'self_determination',
    note: 'Autonomy is retained as a game-level behavioral dimension derived from self-determination theory rather than pretending it is an ai-uni psychometric construct.',
  },
} as const;

export const p003PsychologyBoundary =
  'P003 absorbs the full ai-uni construct registry as evidence policy. Absorption does not mean every construct becomes a player-facing score: CAPE/PCL-associated constructs remain research-only, attachment remains relationship-specific, and all conclusions require repeated cross-context evidence.';
