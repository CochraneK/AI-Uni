export type TheoryCatalogId =
  | 'erikson_development'
  | 'life_course'
  | 'bronfenbrenner_ecology'
  | 'family_systems_intergenerational'
  | 'attachment_relationship_specific'
  | 'identity_development'
  | 'stress_coping_resilience'
  | 'self_determination'
  | 'social_convoy_networks'
  | 'socioemotional_selectivity'
  | 'selection_optimization_compensation'
  | 'meaning_generativity_life_review';

export type TheoryCatalogEntry = {
  id: TheoryCatalogId;
  label: string;
  useFor: string[];
  gameMechanics: string[];
  doNotUseFor: string[];
};

export const theoryCatalog: Record<TheoryCatalogId, TheoryCatalogEntry> = {
  erikson_development: {
    id: 'erikson_development',
    label: 'Erikson-inspired lifespan developmental themes',
    useFor: ['chapter themes', 'age-linked developmental tasks', 'life-review prompts'],
    gameMechanics: ['chapter goals', 'role transitions', 'reopened developmental tasks'],
    doNotUseFor: ['maturity score', 'normal/abnormal classification', 'mandatory marriage or parenthood'],
  },
  life_course: {
    id: 'life_course',
    label: 'Life-course perspective',
    useFor: ['timing', 'turning points', 'path dependence', 'linked lives', 'cumulative advantage/disadvantage'],
    gameMechanics: ['event history', 'branch probabilities', 'long-term consequences', 'historical context'],
    doNotUseFor: ['deterministic prediction from one early event'],
  },
  bronfenbrenner_ecology: {
    id: 'bronfenbrenner_ecology',
    label: 'Ecological systems perspective',
    useFor: ['person-context interaction', 'school/work/family/social environment', 'historical and cultural context'],
    gameMechanics: ['context modifiers', 'institutional constraints', 'opportunity structures', 'macro events'],
    doNotUseFor: ['reducing structural problems to personality'],
  },
  family_systems_intergenerational: {
    id: 'family_systems_intergenerational',
    label: 'Family systems and intergenerational transmission',
    useFor: ['family scripts', 'boundaries', 'communication', 'caregiving', 'intergenerational repetition and repair'],
    gameMechanics: ['family state', 'cross-generation events', 'pattern repetition/reversal/revision'],
    doNotUseFor: ['childhood-determines-adulthood rules', 'parent-blaming'],
  },
  attachment_relationship_specific: {
    id: 'attachment_relationship_specific',
    label: 'Relationship-specific attachment dynamics',
    useFor: ['trust', 'proximity seeking', 'dependence comfort', 'reassurance', 'withdrawal', 'rupture and repair'],
    gameMechanics: ['per-relationship state', 'responsiveness history', 'conflict repair', 'trust updating'],
    doNotUseFor: ['one global permanent attachment label', 'single-scene classification'],
  },
  identity_development: {
    id: 'identity_development',
    label: 'Identity exploration and commitment',
    useFor: ['education', 'career', 'values', 'relationships', 'family and lifestyle identity'],
    gameMechanics: ['identity-domain state', 'exploration opportunities', 'commitment/revision events'],
    doNotUseFor: ['forcing one correct identity trajectory'],
  },
  stress_coping_resilience: {
    id: 'stress_coping_resilience',
    label: 'Stress appraisal, coping and resilience',
    useFor: ['exam stress', 'breakups', 'job loss', 'caregiving', 'health stress', 'recovery'],
    gameMechanics: ['appraisal', 'coping choices', 'resource use', 'recovery latency', 'strategy flexibility'],
    doNotUseFor: ['assuming exposure automatically causes disorder', 'equating resilience with never struggling'],
  },
  self_determination: {
    id: 'self_determination',
    label: 'Autonomy, competence and relatedness needs',
    useFor: ['motivation quality', 'choice ownership', 'mastery', 'belonging'],
    gameMechanics: ['autonomy support', 'competence feedback', 'relationship connection', 'intrinsic vs pressured goals'],
    doNotUseFor: ['one-number motivation score'],
  },
  social_convoy_networks: {
    id: 'social_convoy_networks',
    label: 'Social convoy and network support',
    useFor: ['changing social networks across life', 'support availability', 'mentor and bridge ties', 'isolation'],
    gameMechanics: ['network graph', 'tie strength', 'reciprocity', 'support access', 'relationship loss/new ties'],
    doNotUseFor: ['treating friend count as wellbeing'],
  },
  socioemotional_selectivity: {
    id: 'socioemotional_selectivity',
    label: 'Socioemotional selectivity in later life',
    useFor: ['changing priorities when time horizons feel shorter', 'emotionally meaningful relationships'],
    gameMechanics: ['selective relationship investment', 'goal reprioritization', 'smaller but meaningful networks'],
    doNotUseFor: ['assuming older adults are socially withdrawn'],
  },
  selection_optimization_compensation: {
    id: 'selection_optimization_compensation',
    label: 'Selection, optimization and compensation',
    useFor: ['adaptation to changing resources, health, time and ability'],
    gameMechanics: ['goal selection', 'skill/resource investment', 'assistive strategies', 'role substitution'],
    doNotUseFor: ['framing aging only as decline'],
  },
  meaning_generativity_life_review: {
    id: 'meaning_generativity_life_review',
    label: 'Meaning, generativity and life review',
    useFor: ['midlife contribution', 'legacy', 'retirement', 'regret', 'life integration'],
    gameMechanics: ['value-consistent choices', 'mentoring', 'unfinished goals', 'life-review callbacks'],
    doNotUseFor: ['declaring one objectively successful life'],
  },
};

export const theoryBoundary =
  'Theory metadata guides content and state transitions. It is not a psychometric score, diagnosis, or deterministic rule about a player.';
