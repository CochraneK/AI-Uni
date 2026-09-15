import type {
  EcologicalContextSnapshot,
  FamilySystemSnapshot,
  LifeProfileSnapshot,
  RelationshipSnapshot,
} from './types';

export const lifeModelPrinciples = [
  'Developmental theories organize narrative themes; they do not diagnose maturity, pathology or success.',
  'Family history changes probabilities and available scripts, not destiny. Repetition, reversal and repair are all possible.',
  'Attachment-like behavior is relationship-specific and dynamic; do not permanently label a player as secure, anxious or avoidant.',
  'Behavior is jointly shaped by person, relationship, institution, resources, historical context and current state.',
  'Repeated observations across contexts are stronger evidence than one event.',
  'Protective factors, supportive relationships and successful coping must be able to alter later trajectories.',
  'Marriage, parenthood and conventional careers are optional branches, not required markers of healthy development.',
  'University-specific templates may change context and opportunity structures but must not change the core interpretation boundaries.',
  'Game state is not a clinical record and must not be presented as diagnosis or treatment guidance.',
] as const;

export const defaultLifeProfile: LifeProfileSnapshot = {
  universityProfileId: 'generic_university',
  age: 18,
  season: 'university',
  lifeStage: 'late_adolescence_identity',
  chapterId: 'university_first_week',
  chapterUnit: 1,
  totalGameDays: 1,
  academicYear: 'year_1',
  careerStage: 'student',
  identityState: {
    education: 0.45,
    career: 0.2,
    relationships: 0.35,
    family: 0.55,
    community: 0.25,
    values: 0.4,
    competence: 0.4,
    lifestyle: 0.3,
  },
  currentStressLoad: 0.2,
  perceivedSupport: 0.5,
  recoveryCapacity: 0.5,
  meaningOrientation: 0.35,
};

export const defaultFamilySystem: FamilySystemSnapshot = {
  dimensions: {
    communication_openness: 0.5,
    emotional_expression: 0.5,
    autonomy_support: 0.5,
    psychological_control: 0.2,
    achievement_pressure: 0.4,
    boundary_flexibility: 0.5,
    conflict_repair: 0.5,
    caregiving_reliability: 0.6,
    financial_security: 0.5,
    intergenerational_closeness: 0.55,
  },
  activePatterns: [],
  protectiveFactors: [],
  stressors: [],
};

export const createDefaultRelationship = (
  personKey: string,
  relationshipType: RelationshipSnapshot['relationshipType'],
): RelationshipSnapshot => ({
  personKey,
  relationshipType,
  dimensions: {
    trust: 0.5,
    closeness: 0.25,
    reciprocity: 0.5,
    reliability: 0.5,
    conflict_repair: 0.5,
    comfort_with_dependence: 0.4,
    fear_of_rejection: 0.3,
    reassurance_seeking: 0.25,
    withdrawal: 0.25,
    boundary_clarity: 0.5,
  },
  sharedHistory: [],
  unresolvedIssues: [],
  attachmentSignals: {
    anxietyLike: 0.3,
    avoidanceLike: 0.3,
  },
});

export const baselineEcology: EcologicalContextSnapshot[] = [
  {
    system: 'microsystem',
    key: 'student_living_arrangement',
    description: '宿舍、校外合租、家庭居住或其他日常居住与通勤环境。',
    opportunity: 0.7,
    stress: 0.25,
    stability: 0.6,
  },
  {
    system: 'microsystem',
    key: 'classroom',
    description: '课程、老师、同学和学业评价。',
    opportunity: 0.65,
    stress: 0.35,
    stability: 0.7,
  },
  {
    system: 'microsystem',
    key: 'family_home',
    description: '原生家庭联系、支持、期待与冲突。',
    opportunity: 0.55,
    stress: 0.25,
    stability: 0.7,
  },
  {
    system: 'mesosystem',
    key: 'family_school_link',
    description: '家庭期待与学校路径之间的互动，例如专业、继续教育或就业选择。',
    opportunity: 0.45,
    stress: 0.3,
    stability: 0.55,
  },
  {
    system: 'exosystem',
    key: 'labor_market',
    description: '实习与就业机会、行业景气度和组织条件。',
    opportunity: 0.5,
    stress: 0.25,
    stability: 0.4,
  },
  {
    system: 'macrosystem',
    key: 'social_norms',
    description: '关于成绩、职业、婚恋、家庭和成功的社会规范与文化期待。',
    opportunity: 0.4,
    stress: 0.3,
    stability: 0.75,
  },
  {
    system: 'chronosystem',
    key: 'historical_period',
    description: '经济周期、技术变化、公共事件和代际环境。',
    opportunity: 0.5,
    stress: 0.2,
    stability: 0.35,
  },
];

export const familyTransmissionModes = {
  repetition: {
    label: '模式重复',
    description: '在新关系中沿用熟悉的沟通、边界或冲突模式。',
  },
  reversal: {
    label: '反向补偿',
    description: '有意识地采取与上一代明显相反的方式，但仍可能受原有模式牵引。',
  },
  revision: {
    label: '整合修正',
    description: '识别旧模式、保留有益部分并发展新的关系策略。',
  },
} as const;

export const attachmentModelBoundary = {
  unitOfAnalysis: 'relationship',
  rule: 'Attachment-like signals belong to a specific relationship and context. They may change with repeated responsiveness, rupture, repair, loss and new experiences.',
  forbiddenShortcut: 'Do not convert a single interaction into a permanent attachment-style label.',
};

export const stressAdaptationLoop = [
  'stressor',
  'appraisal',
  'coping_strategy',
  'resource_use',
  'social_response',
  'short_term_outcome',
  'recovery',
  'learning_or_carryover',
] as const;

export const socialNetworkDimensions = [
  'network_size',
  'tie_strength',
  'support_availability',
  'support_reciprocity',
  'mentor_access',
  'bridge_ties',
  'relationship_diversity',
  'isolation_risk',
  'conflict_spillover',
] as const;

export const meaningDimensions = [
  'purpose',
  'coherence',
  'belonging',
  'generativity',
  'life_satisfaction',
  'regret',
  'acceptance',
  'unfinished_goals',
] as const;

export const trajectoryMechanisms = {
  accumulation: 'Repeated small advantages or disadvantages can compound across chapters.',
  turningPoint: 'A major opportunity, setback, relationship or role change may redirect the current path.',
  timing: 'The same event can have different meaning depending on age, role and current developmental tasks.',
  linkedLives: 'Important people influence each other over time; family, partners, friends and mentors have connected trajectories.',
  plasticity: 'Later experiences can revise earlier patterns; trajectories are not fixed by childhood or one decision.',
} as const;
