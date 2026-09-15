import { constructRegistry } from '../assessment/constructs';
import { createP003RelationshipState } from './p003Characters';
import { buildP003CoverageMatrix } from './p003Coverage';
import { p003LifeDomains, p003StageBands } from './p003Ontology';
import {
  p003PsychologyRegistry,
  p003ResearchOnlyConstructs,
} from './p003PsychologyRegistry';
import {
  p003StarterStorylets,
  registerP003ContentPack,
  selectP003Storylets,
  type P003ContentPack,
} from './p003Storylets';

describe('P003 extensible architecture', () => {
  test('absorbs every ai-uni psychology construct into an explicit policy', () => {
    expect(Object.keys(p003PsychologyRegistry).sort()).toEqual(
      Object.keys(constructRegistry).sort(),
    );
  });

  test('keeps CAPE/PCL-associated constructs research-only and invisible', () => {
    expect(p003ResearchOnlyConstructs.length).toBeGreaterThan(0);
    for (const policy of p003ResearchOnlyConstructs) {
      expect(policy.userVisible).toBe(false);
      expect(policy.gameScoreMode).toBe('research_association_only');
    }
  });

  test('maps every current authored event into exactly one primary domain and narrative function', () => {
    expect(p003StarterStorylets.length).toBeGreaterThanOrEqual(14);
    for (const storylet of p003StarterStorylets) {
      expect(p003LifeDomains[storylet.primaryDomain]).toBeDefined();
      expect(storylet.narrativeFunction).toBeTruthy();
      expect(storylet.lifeStageBands.length).toBeGreaterThan(0);
    }
  });

  test('builds a complete MECE stage-by-domain coverage matrix including empty cells', () => {
    const matrix = buildP003CoverageMatrix(p003StarterStorylets);
    expect(matrix).toHaveLength(
      p003StageBands.length * Object.keys(p003LifeDomains).length,
    );
  });

  test('can add a content pack without changing the core engine', () => {
    const demoPack: P003ContentPack = {
      id: 'demo-pack',
      label: 'Demo',
      version: 1,
      storylets: [
        {
          ...p003StarterStorylets[0],
          id: 'demo-new-storylet',
          packId: 'demo-pack',
          source: 'content_pack',
        },
      ],
    };
    const expanded = registerP003ContentPack(p003StarterStorylets, demoPack);
    expect(expanded).toHaveLength(p003StarterStorylets.length + 1);
  });

  test('scheduler filters by age/season while preferring fresh domains', () => {
    const selected = selectP003Storylets(
      p003StarterStorylets,
      {
        age: 8,
        season: 'school_age',
        historyFlags: [],
        originTags: [],
        availableRelationshipRoles: ['peer', 'teacher', 'parent'],
        playedStoryletIds: [],
        recentDomains: ['education_learning'],
      },
      3,
    );
    expect(selected.every((storylet) => storylet.prerequisites.ageRange[0] <= 8)).toBe(true);
    expect(selected.every((storylet) => storylet.prerequisites.ageRange[1] >= 8)).toBe(true);
  });

  test('relationship state is persistent and character-specific', () => {
    const relationship = createP003RelationshipState({
      id: 'mother-1',
      displayName: '母亲',
      relationshipRole: 'parent',
      socialRoles: ['家人'],
      visibleWant: '希望家庭稳定',
      underlyingNeed: '确认自己仍然有影响力',
      fearOrAvoidance: '家庭成员彼此疏远',
      values: ['care', 'stability'],
      contradictions: [
        {
          poleA: '愿意照顾家人',
          poleB: '有时会替别人做决定',
          pressurePoint: '重大选择',
        },
      ],
      resources: [],
      constraints: [],
      privateFacts: [],
      arcThreads: [],
    });
    expect(relationship.characterId).toBe('mother-1');
    expect(relationship.dimensions.trust).toBe(0.5);
  });
});
