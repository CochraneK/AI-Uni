export type LifeSeasonId =
  | 'university'
  | 'early_career'
  | 'partnership_family'
  | 'midlife'
  | 'later_career'
  | 'retirement'
  | 'life_review';

export type LifeStageId =
  | 'late_adolescence_identity'
  | 'emerging_adulthood'
  | 'early_adulthood_intimacy'
  | 'adulthood_generativity'
  | 'later_adulthood_transition'
  | 'late_life_integrity';

export type AcademicYear = 'year_1' | 'year_2' | 'year_3' | 'year_4' | 'postgraduate' | 'none';

export type CareerStage =
  | 'student'
  | 'internship'
  | 'job_search'
  | 'early_career'
  | 'established_career'
  | 'career_transition'
  | 'late_career'
  | 'retired'
  | 'not_applicable';

export type RelationshipType =
  | 'parent'
  | 'sibling'
  | 'roommate'
  | 'friend'
  | 'close_friend'
  | 'romantic_partner'
  | 'spouse'
  | 'child'
  | 'teacher'
  | 'mentor'
  | 'coworker'
  | 'manager'
  | 'community';

export type DevelopmentalTaskId =
  | 'identity_exploration'
  | 'autonomy_from_family'
  | 'belonging'
  | 'education_commitment'
  | 'career_exploration'
  | 'intimacy'
  | 'partnership_commitment'
  | 'work_competence'
  | 'family_formation'
  | 'parenting_or_caregiving'
  | 'generativity'
  | 'care_for_older_generation'
  | 'career_reappraisal'
  | 'retirement_transition'
  | 'social_role_reconstruction'
  | 'meaning_making'
  | 'life_review';

export type EcologicalSystem =
  | 'individual'
  | 'microsystem'
  | 'mesosystem'
  | 'exosystem'
  | 'macrosystem'
  | 'chronosystem';

export type IdentityDomain =
  | 'education'
  | 'career'
  | 'relationships'
  | 'family'
  | 'community'
  | 'values'
  | 'competence'
  | 'lifestyle';

export type LifeEventCategory =
  | 'education'
  | 'exam'
  | 'holiday'
  | 'relationship'
  | 'family'
  | 'career'
  | 'financial'
  | 'health'
  | 'relocation'
  | 'bereavement'
  | 'achievement'
  | 'failure'
  | 'social'
  | 'historical_context'
  | 'retirement';

export type TurningPointKind =
  | 'opportunity'
  | 'setback'
  | 'transition'
  | 'loss'
  | 'commitment'
  | 'role_change'
  | 'none';

export type FamilyPatternDimension =
  | 'communication_openness'
  | 'emotional_expression'
  | 'autonomy_support'
  | 'psychological_control'
  | 'achievement_pressure'
  | 'boundary_flexibility'
  | 'conflict_repair'
  | 'caregiving_reliability'
  | 'financial_security'
  | 'intergenerational_closeness';

export type RelationshipDimension =
  | 'trust'
  | 'closeness'
  | 'reciprocity'
  | 'reliability'
  | 'conflict_repair'
  | 'comfort_with_dependence'
  | 'fear_of_rejection'
  | 'reassurance_seeking'
  | 'withdrawal'
  | 'boundary_clarity';

export type StressAppraisal = 'challenge' | 'threat' | 'loss' | 'manageable' | 'uncertain';

export type CopingStrategy =
  | 'problem_focused'
  | 'emotion_focused'
  | 'support_seeking'
  | 'avoidance'
  | 'reappraisal'
  | 'acceptance'
  | 'planning'
  | 'distraction';

export type LifeResearchSignalId =
  | 'identity.exploration'
  | 'identity.commitment'
  | 'identity.flexibility'
  | 'family.autonomy_negotiation'
  | 'family.conflict_repair'
  | 'family.intergenerational_repetition'
  | 'family.intergenerational_revision'
  | 'relationship.trust_update'
  | 'relationship.support_reciprocity'
  | 'relationship.conflict_repair'
  | 'relationship.proximity_seeking'
  | 'relationship.withdrawal'
  | 'network.social_support'
  | 'network.bridge_ties'
  | 'network.isolation'
  | 'adaptation.appraisal'
  | 'adaptation.recovery'
  | 'adaptation.strategy_flexibility'
  | 'resilience.resource_use'
  | 'meaning.purpose'
  | 'meaning.generativity'
  | 'meaning.life_satisfaction'
  | 'meaning.regret_integration';

export type DevelopmentalTask = {
  id: DevelopmentalTaskId;
  label: string;
  description: string;
  optional: boolean;
};

export type LifeStageDefinition = {
  id: LifeStageId;
  label: string;
  typicalAgeRange: [number, number];
  eriksonInspiredTheme: string;
  tasks: DevelopmentalTask[];
  notes: string[];
};

export type LifeChapterDefinition = {
  id: string;
  season: LifeSeasonId;
  title: string;
  ageRange: [number, number];
  timeScale: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'multi_year';
  expectedPlayableUnits: number;
  developmentalTasks: DevelopmentalTaskId[];
  eventPools: LifeEventCategory[];
};

export type LifeProfileSnapshot = {
  age: number;
  season: LifeSeasonId;
  lifeStage: LifeStageId;
  chapterId: string;
  chapterUnit: number;
  totalGameDays: number;
  academicYear: AcademicYear;
  careerStage: CareerStage;
  identityState: Partial<Record<IdentityDomain, number>>;
  currentStressLoad: number;
  perceivedSupport: number;
  recoveryCapacity: number;
  meaningOrientation: number;
};

export type FamilySystemSnapshot = {
  dimensions: Partial<Record<FamilyPatternDimension, number>>;
  activePatterns: string[];
  protectiveFactors: string[];
  stressors: string[];
};

export type RelationshipSnapshot = {
  personKey: string;
  relationshipType: RelationshipType;
  dimensions: Partial<Record<RelationshipDimension, number>>;
  sharedHistory: string[];
  unresolvedIssues: string[];
  attachmentSignals?: {
    anxietyLike?: number;
    avoidanceLike?: number;
  };
};

export type EcologicalContextSnapshot = {
  system: EcologicalSystem;
  key: string;
  description: string;
  opportunity: number;
  stress: number;
  stability: number;
};

export type LifeEventRecord = {
  eventId: string;
  category: LifeEventCategory;
  title: string;
  age: number;
  chapterId: string;
  turningPoint: TurningPointKind;
  appraisal?: StressAppraisal;
  coping?: CopingStrategy[];
  linkedPeople?: string[];
  ecologicalContexts?: string[];
  consequences?: string[];
};
