import type { ConstructId } from '../assessment/constructs';
import type { LifeSeasonId, RelationshipType } from './types';
import { p003StarterEvents, type P003EffectMap } from './p003Events';
import { p003ChoiceSignals } from './p003Personality';
import { currentP003ReportBridge } from './p003PsychologyRegistry';
import {
  legacyCategoryPrimaryDomain,
  stageBandForAge,
  type P003LifeDomainId,
  type P003LifeStageBandId,
  type P003NarrativeFunctionId,
  type P003NarrativeTechniqueId,
} from './p003Ontology';
import type { P003PressureShapeId } from './p003PressureShapes';

export type P003StoryletPrerequisites = {
  ageRange: [number, number];
  seasons?: LifeSeasonId[];
  requiredFlags?: string[];
  excludedFlags?: string[];
  requiredOriginTags?: string[];
  requiredRelationshipRoles?: RelationshipType[];
};

export type P003StoryletChoice = {
  id: string;
  label: string;
  summary: string;
  immediate: P003EffectMap;
  historyFlags: string[];
  delayedHooks: string[];
  analysisSignalIds: string[];
};

export type P003Storylet = {
  id: string;
  packId: string;
  version: number;
  active: boolean;
  title: string;
  setup: string;
  visibleQuestion: string;
  primaryDomain: P003LifeDomainId;
  crossDomainTags: P003LifeDomainId[];
  lifeStageBands: P003LifeStageBandId[];
  narrativeFunction: P003NarrativeFunctionId;
  techniques: P003NarrativeTechniqueId[];
  pressureShapes: P003PressureShapeId[];
  prerequisites: P003StoryletPrerequisites;
  castSlots: RelationshipType[];
  choices: P003StoryletChoice[];
  delayedHooks: string[];
  designNote: string;
  source: 'legacy_p003' | 'content_pack';
};

export type P003ContentPack = {
  id: string;
  label: string;
  version: number;
  storylets: P003Storylet[];
};

const domainOverrides: Partial<Record<string, P003LifeDomainId>> = {
  first_favorite_object: 'self_identity',
  toddler_forbidden_drawer: 'self_identity',
  first_public_meltdown: 'self_identity',
  playground_turn: 'friendship_social',
  caregiver_late_pickup: 'family_kinship',
  moving_house_childhood: 'material_life',
  first_school_gate: 'education_learning',
  first_school_lunch: 'friendship_social',
  exam_result_comparison: 'education_learning',
  post_school_crossroads: 'education_learning',
  first_bad_manager: 'work_career',
  midlife_parent_call: 'family_kinship',
  retirement_first_monday: 'meaning_creation',
  life_review_old_message: 'meaning_creation',
};

const narrativeFunctionOverrides: Partial<Record<string, P003NarrativeFunctionId>> = {
  first_favorite_object: 'establish_world',
  toddler_forbidden_drawer: 'test_value',
  first_public_meltdown: 'pressure',
  playground_turn: 'relationship_move',
  caregiver_late_pickup: 'pressure',
  moving_house_childhood: 'loss',
  first_school_gate: 'opportunity',
  first_school_lunch: 'relationship_move',
  exam_result_comparison: 'pressure',
  post_school_crossroads: 'commitment',
  first_bad_manager: 'pressure',
  midlife_parent_call: 'relationship_move',
  retirement_first_monday: 'reversal',
  life_review_old_message: 'reflection',
};

const pressureShapeOverrides: Partial<Record<string, P003PressureShapeId[]>> = {
  first_favorite_object: ['neutral', 'opportunity'],
  toddler_forbidden_drawer: ['conflict', 'uncertainty'],
  first_public_meltdown: ['conflict', 'humiliation'],
  playground_turn: ['belonging', 'conflict'],
  caregiver_late_pickup: ['uncertainty', 'belonging'],
  moving_house_childhood: ['loss', 'transition'],
  first_school_gate: ['transition', 'uncertainty', 'opportunity'],
  first_school_lunch: ['belonging'],
  exam_result_comparison: ['achievement', 'humiliation'],
  post_school_crossroads: ['transition', 'opportunity', 'uncertainty'],
  first_bad_manager: ['entrapment', 'conflict', 'role_overload'],
  midlife_parent_call: ['caregiving', 'role_overload', 'conflict'],
  retirement_first_monday: ['transition', 'loss', 'opportunity'],
  life_review_old_message: ['loss', 'belonging', 'transition'],
};

const castOverrides: Partial<Record<string, RelationshipType[]>> = {
  first_favorite_object: ['caregiver'],
  toddler_forbidden_drawer: ['caregiver'],
  first_public_meltdown: ['caregiver'],
  playground_turn: ['peer'],
  caregiver_late_pickup: ['caregiver', 'teacher'],
  moving_house_childhood: ['caregiver', 'peer'],
  first_school_gate: ['teacher', 'peer'],
  first_school_lunch: ['peer'],
  exam_result_comparison: ['peer', 'parent'],
  post_school_crossroads: ['parent', 'peer', 'teacher'],
  first_bad_manager: ['manager', 'coworker'],
  midlife_parent_call: ['parent', 'sibling'],
  retirement_first_monday: ['friend', 'community'],
  life_review_old_message: ['friend'],
};

const lifeStageBandsForRange = ([min, max]: [number, number]): P003LifeStageBandId[] => {
  const candidates = new Set<P003LifeStageBandId>();
  for (let age = Math.max(0, Math.floor(min)); age <= Math.min(100, Math.ceil(max)); age += 1) {
    candidates.add(stageBandForAge(age));
  }
  return [...candidates];
};

const signalIdsForChoice = (eventId: string, choiceId: string): string[] => {
  const signal = p003ChoiceSignals[`${eventId}:${choiceId}`];
  if (!signal) return [];
  return Object.keys(signal.scores).map(
    (dimensionId) =>
      currentP003ReportBridge[
        dimensionId as keyof typeof currentP003ReportBridge
      ] ?? dimensionId,
  );
};

export const p003StarterStorylets: P003Storylet[] = p003StarterEvents.map((event) => ({
  id: event.id,
  packId: 'p003-core-foundation',
  version: 1,
  active: true,
  title: event.title,
  setup: event.setup,
  visibleQuestion: event.visibleQuestion,
  primaryDomain: domainOverrides[event.id] ?? legacyCategoryPrimaryDomain[event.category],
  crossDomainTags: [],
  lifeStageBands: lifeStageBandsForRange(event.ageRange),
  narrativeFunction: narrativeFunctionOverrides[event.id] ?? 'reveal_character',
  techniques: event.delayedHooks?.length ? ['delayed_consequence', 'choice_echo'] : ['setup'],
  pressureShapes: pressureShapeOverrides[event.id] ?? ['neutral'],
  prerequisites: {
    ageRange: event.ageRange,
    seasons: event.seasons,
  },
  castSlots: castOverrides[event.id] ?? [],
  choices: event.choices.map((choice) => ({
    id: choice.id,
    label: choice.label,
    summary: choice.summary,
    immediate: choice.immediate,
    historyFlags: choice.historyFlags ?? [],
    delayedHooks: event.delayedHooks ?? [],
    analysisSignalIds: signalIdsForChoice(event.id, choice.id),
  })),
  delayedHooks: event.delayedHooks ?? [],
  designNote: event.designNote,
  source: 'legacy_p003',
}));

export const p003CoreContentPack: P003ContentPack = {
  id: 'p003-core-foundation',
  label: 'P003 Core Foundation',
  version: 1,
  storylets: p003StarterStorylets,
};

export type P003StoryletSelectionState = {
  age: number;
  season: LifeSeasonId;
  historyFlags: string[];
  originTags: string[];
  availableRelationshipRoles: RelationshipType[];
  playedStoryletIds: string[];
  recentDomains: P003LifeDomainId[];
};

export const isP003StoryletEligible = (
  storylet: P003Storylet,
  state: P003StoryletSelectionState,
): boolean => {
  if (!storylet.active) return false;
  const [minAge, maxAge] = storylet.prerequisites.ageRange;
  if (state.age < minAge || state.age > maxAge) return false;
  if (storylet.prerequisites.seasons && !storylet.prerequisites.seasons.includes(state.season)) return false;
  if (storylet.prerequisites.requiredFlags?.some((flag) => !state.historyFlags.includes(flag))) return false;
  if (storylet.prerequisites.excludedFlags?.some((flag) => state.historyFlags.includes(flag))) return false;
  if (storylet.prerequisites.requiredOriginTags?.some((tag) => !state.originTags.includes(tag))) return false;
  if (
    storylet.prerequisites.requiredRelationshipRoles?.some(
      (role) => !state.availableRelationshipRoles.includes(role),
    )
  ) return false;
  return true;
};

const storyletPriority = (storylet: P003Storylet, state: P003StoryletSelectionState) => {
  let score = 0;
  if (!state.playedStoryletIds.includes(storylet.id)) score += 6;
  if (!state.recentDomains.includes(storylet.primaryDomain)) score += 3;
  if (storylet.techniques.includes('callback') || storylet.techniques.includes('choice_echo')) score += 1;
  score += Math.min(storylet.delayedHooks.length, 3) * 0.25;
  return score;
};

export const selectP003Storylets = (
  storylets: P003Storylet[],
  state: P003StoryletSelectionState,
  limit = 3,
): P003Storylet[] =>
  storylets
    .filter((storylet) => isP003StoryletEligible(storylet, state))
    .sort((a, b) => {
      const priority = storyletPriority(b, state) - storyletPriority(a, state);
      return priority !== 0 ? priority : a.id.localeCompare(b.id);
    })
    .slice(0, limit);

export const registerP003ContentPack = (
  existing: P003Storylet[],
  pack: P003ContentPack,
): P003Storylet[] => {
  const ids = new Set(existing.map((storylet) => storylet.id));
  for (const storylet of pack.storylets) {
    if (ids.has(storylet.id)) {
      throw new Error(`Duplicate P003 storylet id: ${storylet.id}`);
    }
    ids.add(storylet.id);
  }
  return [...existing, ...pack.storylets];
};

export const researchConstructIdsInStorylet = (storylet: P003Storylet): ConstructId[] =>
  storylet.choices.flatMap((choice) =>
    choice.analysisSignalIds.filter(
      (id): id is ConstructId =>
        id.startsWith('big5.') ||
        id.startsWith('social.') ||
        id.startsWith('coping.') ||
        id.startsWith('emotion.') ||
        id.startsWith('attachment.') ||
        id.startsWith('decision.') ||
        id.startsWith('cape.') ||
        id.startsWith('pcl5_associated.'),
    ),
  );
