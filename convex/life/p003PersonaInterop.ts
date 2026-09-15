import type {
  P003CharacterBlueprint,
  P003CharacterValueId,
} from './p003Characters';
import type {
  P003LifeDomainId,
  P003LifeStageBandId,
} from './p003Ontology';
import type { RelationshipType } from './types';

export type P003PersonaSchemaVersion = 'persona-kernel.v1';

export type P003PersonaHealthLayer = {
  mentalHealthStatus?: 'healthy' | 'condition' | 'unknown';
  primaryConditionId?: string;
  comorbidConditionIds?: string[];
  symptomTraits?: Record<string, number | string | boolean>;
  visibility: 'private_runtime' | 'research_only' | 'player_visible_if_narratively_relevant';
};

export type P003PersonaDemographics = {
  age?: number;
  birthYear?: number;
  gender?: string;
  education?: string;
  locale?: string;
  maritalStatus?: string;
  socialPosition?: {
    occupationCode?: string;
    occupationLabel?: string;
    incomeBand?: string;
    classPosition?: string;
    authorityLevel?: string;
    communityStatus?: string;
  };
};

export type P003PersonaPsychology = {
  ocean?: Partial<Record<'O' | 'C' | 'E' | 'A' | 'N', number>>;
  personalityTags?: string[];
  cognitiveStyles?: string[];
  copingStyles?: string[];
  values?: string[];
  socialRelations?: Record<string, unknown>;
  communicationStyle?: Record<string, unknown>;
  lifestyleHabits?: Record<string, unknown>;
  skillsAbilities?: Record<string, unknown>;
  coreDesire?: string;
  coreFear?: string;
  formativeWound?: string;
  compensatoryDesire?: string;
  innerNeed?: string;
  arcType?: 'positive' | 'negative' | 'flat' | string;
  arcDescription?: string;
};

export type P003PersonaLifeEventSeed = {
  id?: string;
  age?: number;
  year?: number;
  sourceStage?: string;
  sourceDomain?: string;
  title: string;
  valence?: 'positive' | 'negative' | 'neutral' | string;
  description?: string;
  p003Stage?: P003LifeStageBandId;
  p003PrimaryDomain?: P003LifeDomainId;
  tags?: string[];
};

export type P003ExternalPersonaKernel = {
  schemaVersion: P003PersonaSchemaVersion;
  sourceSystem: string;
  sourcePersonaId: string;
  label?: string;
  archetype?: {
    key?: string;
    name?: string;
    oneLiner?: string;
  };
  demographics: P003PersonaDemographics;
  psychology: P003PersonaPsychology;
  health?: P003PersonaHealthLayer;
  priorLifeEvents?: P003PersonaLifeEventSeed[];
  generationMetadata?: {
    seed?: string | number;
    cohort?: string;
    eraTags?: string[];
    sourceVersion?: string;
  };
};

export type AIPersonaExportV12 = {
  id: string;
  label?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  occupation_code?: string;
  education?: string;
  locale?: string;
  marital_status?: string;
  primary_diagnosis?: string;
  primary_diagnosis_en?: string;
  comorbidities?: string[];
  archetype_key?: string;
  archetype_name?: string;
  archetype_one_liner?: string;
  ocean?: Partial<Record<'O' | 'C' | 'E' | 'A' | 'N', number>>;
  personality_tags?: string[];
  cognitive_styles?: string[];
  coping_styles?: string[];
  social_relations?: Record<string, unknown>;
  values_beliefs?: Record<string, unknown>;
  communication_style?: Record<string, unknown>;
  lifestyle_habits?: Record<string, unknown>;
  skills_abilities?: Record<string, unknown>;
  core_desire?: string;
  core_fear?: string;
  formative_wound?: string;
  compensatory_desire?: string;
  storr_need?: string;
  arc_type?: string;
  arc_description?: string;
  life_events?: Array<Record<string, unknown>>;
};

const aiPersonaDomainMap: Record<string, P003LifeDomainId> = {
  family: 'family_kinship',
  education: 'education_learning',
  occupation: 'work_career',
  health: 'health_body',
  finance: 'material_life',
  interpersonal: 'friendship_social',
};

const aiPersonaStageMap: Record<string, P003LifeStageBandId[]> = {
  childhood: ['early_childhood', 'middle_childhood'],
  adolescence: ['adolescence'],
  adulthood: ['emerging_adulthood', 'early_adulthood'],
  mid_older: ['middle_adulthood', 'later_adulthood', 'late_life'],
};

const normalizeValues = (values?: Record<string, unknown>): string[] =>
  values
    ? Object.entries(values)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key)
    : [];

export const mapAIPersonaDomainToP003 = (
  sourceDomain?: string,
): P003LifeDomainId | undefined =>
  sourceDomain ? aiPersonaDomainMap[sourceDomain] : undefined;

export const mapAIPersonaStageToP003 = (
  sourceStage?: string,
): P003LifeStageBandId[] =>
  sourceStage ? aiPersonaStageMap[sourceStage] ?? [] : [];

export const adaptAIPersonaV12ToP003Kernel = (
  persona: AIPersonaExportV12,
  birthYear?: number,
): P003ExternalPersonaKernel => {
  const isHealthy =
    persona.primary_diagnosis === '无精神障碍（健康）' ||
    persona.primary_diagnosis_en?.toLowerCase().includes('healthy');

  return {
    schemaVersion: 'persona-kernel.v1',
    sourceSystem: 'AI-persona',
    sourcePersonaId: persona.id,
    label: persona.label,
    archetype: {
      key: persona.archetype_key,
      name: persona.archetype_name,
      oneLiner: persona.archetype_one_liner,
    },
    demographics: {
      age: persona.age,
      birthYear,
      gender: persona.gender,
      education: persona.education,
      locale: persona.locale,
      maritalStatus: persona.marital_status,
      socialPosition: {
        occupationCode: persona.occupation_code,
        occupationLabel: persona.occupation,
      },
    },
    psychology: {
      ocean: persona.ocean,
      personalityTags: persona.personality_tags,
      cognitiveStyles: persona.cognitive_styles,
      copingStyles: persona.coping_styles,
      values: normalizeValues(persona.values_beliefs),
      socialRelations: persona.social_relations,
      communicationStyle: persona.communication_style,
      lifestyleHabits: persona.lifestyle_habits,
      skillsAbilities: persona.skills_abilities,
      coreDesire: persona.core_desire,
      coreFear: persona.core_fear,
      formativeWound: persona.formative_wound,
      compensatoryDesire: persona.compensatory_desire,
      innerNeed: persona.storr_need,
      arcType: persona.arc_type,
      arcDescription: persona.arc_description,
    },
    health: {
      mentalHealthStatus: isHealthy ? 'healthy' : persona.primary_diagnosis ? 'condition' : 'unknown',
      primaryConditionId: persona.primary_diagnosis,
      comorbidConditionIds: persona.comorbidities ?? [],
      visibility: 'private_runtime',
    },
    priorLifeEvents: (persona.life_events ?? []).flatMap((event, index) => {
      const title =
        typeof event.name_cn === 'string'
          ? event.name_cn
          : typeof event.name === 'string'
            ? event.name
            : undefined;
      if (!title) return [];
      const sourceDomain =
        typeof event.domain === 'string' ? event.domain : undefined;
      const sourceStage =
        typeof event.stage === 'string' ? event.stage : undefined;
      return [{
        id: `${persona.id}:event:${index}`,
        age: typeof event.age === 'number' ? event.age : undefined,
        sourceStage,
        sourceDomain,
        title,
        valence: typeof event.valence === 'string' ? event.valence : undefined,
        p003PrimaryDomain: mapAIPersonaDomainToP003(sourceDomain),
        tags: ['imported-ai-persona'],
      }];
    }),
  };
};

const valueMap: Record<string, P003CharacterValueId> = {
  family: 'care',
  care: 'care',
  autonomy: 'autonomy',
  achievement: 'achievement',
  security: 'security',
  belonging: 'belonging',
  curiosity: 'curiosity',
  fairness: 'fairness',
  status: 'status',
  freedom: 'freedom',
  stability: 'stability',
  creativity: 'creativity',
  contribution: 'contribution',
};

const inferCharacterValues = (
  values: string[] = [],
): P003CharacterValueId[] => {
  const mapped = values.flatMap((value) => {
    const normalized = value.trim().toLowerCase();
    return valueMap[normalized] ? [valueMap[normalized]] : [];
  });
  return [...new Set(mapped)].slice(0, 5);
};

export const characterBlueprintFromPersonaKernel = (
  kernel: P003ExternalPersonaKernel,
  relationshipRole: RelationshipType,
): P003CharacterBlueprint => ({
  id: `persona:${kernel.sourceSystem}:${kernel.sourcePersonaId}`,
  displayName: kernel.label ?? kernel.archetype?.name ?? '一个人',
  relationshipRole,
  birthYear: kernel.demographics.birthYear,
  socialRoles: [
    relationshipRole,
    kernel.demographics.socialPosition?.occupationLabel,
  ].filter((value): value is string => Boolean(value)),
  visibleWant: kernel.psychology.compensatoryDesire ?? kernel.psychology.coreDesire ?? '维持自己的生活方向',
  underlyingNeed: kernel.psychology.innerNeed ?? '在现实处境中找到能继续生活的方式',
  fearOrAvoidance: kernel.psychology.coreFear ?? '失去重要的关系、资源或自我方向',
  values: inferCharacterValues(kernel.psychology.values),
  contradictions: kernel.psychology.formativeWound
    ? [{
        poleA: kernel.psychology.coreDesire ?? '想靠近自己重视的东西',
        poleB: kernel.psychology.coreFear ?? '又会被旧经验拉回保护模式',
        pressurePoint: kernel.psychology.formativeWound,
      }]
    : [],
  resources: [
    kernel.demographics.education,
    kernel.demographics.socialPosition?.occupationLabel,
    ...(kernel.psychology.skillsAbilities
      ? Object.keys(kernel.psychology.skillsAbilities)
      : []),
  ].filter((value): value is string => Boolean(value)),
  constraints: [
    kernel.demographics.locale,
    kernel.demographics.socialPosition?.classPosition,
  ].filter((value): value is string => Boolean(value)),
  privateFacts: kernel.health?.primaryConditionId
    ? [`health-layer:${kernel.health.primaryConditionId}`]
    : [],
  arcThreads: kernel.psychology.arcDescription
    ? [{
        id: `imported-arc:${kernel.sourcePersonaId}`,
        question: kernel.psychology.arcDescription,
        status: 'latent',
      }]
    : [],
});

export const p003PersonaInteropPrinciples = [
  'AI-persona owns population/persona generation priors; P003 owns runtime life simulation, relationship history and consequences.',
  'A diagnosis or health condition is one optional health layer of a person, never the root identity of a P003 character.',
  'Imported life events are history seeds, not fixed destiny and not mandatory Storylets.',
  'P003 may enrich an imported persona over time but should not silently rewrite the source persona kernel.',
  'The shared interface is language-neutral and versioned so Python AI-persona and TypeScript P003 can evolve independently.',
  'AI-persona current 6-domain × 4-stage event taxonomy is treated as a lossy legacy source; P003 keeps its richer 10-domain × 9-stage ontology.',
] as const;
