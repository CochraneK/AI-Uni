import type { RelationshipDimension, RelationshipType } from './types';

export type P003CharacterValueId =
  | 'care'
  | 'autonomy'
  | 'achievement'
  | 'security'
  | 'belonging'
  | 'curiosity'
  | 'fairness'
  | 'status'
  | 'freedom'
  | 'stability'
  | 'creativity'
  | 'contribution';

export type P003CharacterContradiction = {
  poleA: string;
  poleB: string;
  pressurePoint: string;
};

export type P003CharacterArcThread = {
  id: string;
  question: string;
  openedAtAge?: number;
  resolvedAtAge?: number;
  status: 'latent' | 'active' | 'resolved' | 'reopened';
};

export type P003CharacterBlueprint = {
  id: string;
  displayName: string;
  relationshipRole: RelationshipType;
  birthYear?: number;
  socialRoles: string[];
  visibleWant: string;
  underlyingNeed: string;
  fearOrAvoidance: string;
  values: P003CharacterValueId[];
  contradictions: P003CharacterContradiction[];
  resources: string[];
  constraints: string[];
  privateFacts: string[];
  arcThreads: P003CharacterArcThread[];
};

export type P003RelationshipMemory = {
  eventId: string;
  age: number;
  summary: string;
  valence: -2 | -1 | 0 | 1 | 2;
  unresolved: boolean;
  callbackKeys: string[];
};

export type P003RelationshipState = {
  characterId: string;
  role: RelationshipType;
  dimensions: Partial<Record<RelationshipDimension, number>>;
  memories: P003RelationshipMemory[];
  expectations: string[];
  unresolvedIssues: string[];
  currentSharedGoal?: string;
};

export const createP003RelationshipState = (
  character: P003CharacterBlueprint,
): P003RelationshipState => ({
  characterId: character.id,
  role: character.relationshipRole,
  dimensions: {
    trust: 0.5,
    closeness: 0.5,
    reciprocity: 0.5,
    reliability: 0.5,
    conflict_repair: 0.5,
    comfort_with_dependence: 0.5,
    fear_of_rejection: 0.5,
    reassurance_seeking: 0.5,
    withdrawal: 0.5,
    boundary_clarity: 0.5,
  },
  memories: [],
  expectations: [],
  unresolvedIssues: [],
});

export const addRelationshipMemory = (
  relationship: P003RelationshipState,
  memory: P003RelationshipMemory,
): P003RelationshipState => ({
  ...relationship,
  memories: [...relationship.memories, memory],
  unresolvedIssues: memory.unresolved
    ? [...relationship.unresolvedIssues, memory.summary]
    : relationship.unresolvedIssues,
});

export const p003CharacterWritingRules = [
  'NPCs have their own goals, resources and life changes; they are not props built only to test the player.',
  'Use Want / Need / Fear / Contradiction as dramatic writing tools, never as clinical labels.',
  'No character should be reducible to one adjective such as controlling, avoidant or kind.',
  'A recurring NPC should be able to surprise the player while remaining consistent with accumulated history.',
  'Parents, partners, friends and coworkers age and experience linked lives alongside the player.',
] as const;
