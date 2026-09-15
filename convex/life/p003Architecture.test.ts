import { constructRegistry } from '../assessment/constructs';
import { createP003RelationshipState } from './p003Characters';
import {
  characterAgeAtPlayerAge,
  generateP003CoreCast,
} from './p003Cast';
import { generateLifeOrigin } from './origin';
import {
  adaptAIPersonaV12ToP003Kernel,
  characterBlueprintFromPersonaKernel,
} from './p003PersonaInterop';
import { buildP003CoverageMatrix } from './p003Coverage';
import { p003LifeDomains, p003StageBands } from './p003Ontology';
import {
  p003PsychologyRegistry,
  p003ResearchOnlyConstructs,
} from './p003PsychologyRegistry';
import { buildP003PsychologyCoverage } from './p003PsychologyCoverage';
import {
  p003StarterStorylets,
  registerP003ContentPack,
  selectP003Storylets,
  type P003ContentPack,
} from './p003Storylets';
import { buildP003RunPlan } from './p003RunPlan';
import { instantiateP003NarrativeKernel } from './p003Archetypes';
import {
  buildP003ArchetypeCoverage,
  validateP003ArchetypeGrid,
} from './p003ArchetypeCoverage';
import { auditP003CatalogConstraints } from './p003Constraints';
import {
  p003DefaultPopulationPriors,
  validateP003PopulationPriors,
} from './p003PopulationPriors';

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

  test('audits every ai-uni psychology construct without inventing missing evidence', () => {
    const coverage = buildP003PsychologyCoverage(p003StarterStorylets);
    expect(coverage).toHaveLength(Object.keys(constructRegistry).length);
    const researchOnly = coverage.filter((row) => row.surface === 'research_only');
    expect(researchOnly.every((row) => row.status === 'research_only_no_content' || row.status === 'thin')).toBe(true);
  });

  test('adapts AI-persona archetype-grid thinking into deterministic non-clinical NPC kernels', () => {
    const a = instantiateP003NarrativeKernel('npc-seed', 'friend');
    const b = instantiateP003NarrativeKernel('npc-seed', 'friend');
    expect(a).toEqual(b);
    expect(a.archetypeKey).toBeTruthy();
    expect(a.formativePressure).toBeTruthy();
    expect(a.compensatoryStrategy).toBeTruthy();
    expect(a.developmentalNeed).toBeTruthy();
    expect(a.source).toBe('p003_archetype_grid');
  });

  test('deep archetype grid is auditable and covers every current recurring runtime role', () => {
    expect(validateP003ArchetypeGrid()).toEqual([]);
    const coverage = buildP003ArchetypeCoverage();
    const currentRuntimeRoles = ['parent', 'friend', 'teacher', 'coworker', 'manager'];
    for (const role of currentRuntimeRoles) {
      const row = coverage.find((item) => item.role === role);
      expect(row).toBeDefined();
      expect(row?.archetypeCount).toBeGreaterThanOrEqual(2);
      expect(row?.status).not.toBe('missing');
    }
  });

  test('current Storylet catalog uses a diverse set of pressure shapes', () => {
    const shapes = new Set(
      p003StarterStorylets.flatMap((storylet) => storylet.pressureShapes),
    );
    expect(shapes.size).toBeGreaterThanOrEqual(10);
  });

  test('current Storylet catalog passes hard cross-constraint checks', () => {
    const issues = auditP003CatalogConstraints(p003StarterStorylets);
    expect(issues.filter((issue) => issue.severity === 'error')).toEqual([]);
  });

  test('population priors are versioned, sourced and explicitly non-representative by default', () => {
    expect(validateP003PopulationPriors(p003DefaultPopulationPriors)).toEqual([]);
    expect(p003DefaultPopulationPriors.representativeClaim).toBe(false);
    expect(p003DefaultPopulationPriors.sourceNote.length).toBeGreaterThan(20);
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

  test('run plan samples the catalog deterministically without duplicate storylets', () => {
    const a = buildP003RunPlan('same-seed', p003StarterStorylets);
    const b = buildP003RunPlan('same-seed', p003StarterStorylets);
    expect(a).toEqual(b);
    expect(new Set(a.map((item) => item.storyletId)).size).toBe(a.length);
    expect(a.length).toBeLessThanOrEqual(p003StarterStorylets.length);
    expect(a.every((item, index) => index === 0 || item.age >= a[index - 1].age)).toBe(true);
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

  test('AI-persona exports adapt into a versioned persona kernel without making diagnosis the character identity', () => {
    const kernel = adaptAIPersonaV12ToP003Kernel(
      {
        id: 'persona-001',
        label: '测试人物',
        age: 28,
        gender: 'female',
        occupation: '软件和信息技术服务人员',
        occupation_code: '4-04',
        education: '本科',
        locale: 'urban',
        marital_status: 'single',
        primary_diagnosis: '重度抑郁障碍',
        comorbidities: ['广泛性焦虑障碍'],
        archetype_key: 'hidden_sufferer',
        archetype_name: '隐忍承担型',
        ocean: { O: 6, C: 5, E: 3, A: 7, N: 8 },
        personality_tags: ['谨慎'],
        core_desire: '被理解',
        core_fear: '成为负担',
        formative_wound: '长期忽视自己的需要',
        compensatory_desire: '证明自己值得被需要',
        storr_need: '允许自己接受帮助',
        life_events: [
          {
            domain: 'occupation',
            stage: 'adulthood',
            name_cn: '第一次正式工作',
            valence: 'neutral',
            event_type: 'entrapment',
          },
        ],
      },
      1998,
    );

    expect(kernel.schemaVersion).toBe('persona-kernel.v1');
    expect(kernel.health?.primaryConditionId).toBe('重度抑郁障碍');
    expect(kernel.health?.visibility).toBe('private_runtime');
    expect(kernel.priorLifeEvents?.[0]?.p003PrimaryDomain).toBe('work_career');
    expect(kernel.priorLifeEvents?.[0]?.pressureShapes).toEqual(['entrapment']);

    const character = characterBlueprintFromPersonaKernel(kernel, 'coworker');
    expect(character.displayName).toBe('测试人物');
    expect(character.visibleWant).toBe('证明自己值得被需要');
    expect(character.privateFacts[0]).toContain('health-layer:');
    expect(character.displayName).not.toContain('抑郁');
    expect(character.narrativeKernel?.archetypeKey).toBe('hidden_sufferer');
    expect(character.narrativeKernel?.formativePressure).toBe('长期忽视自己的需要');
    expect(character.narrativeKernel?.source).toBe('external_persona');
  });

  test('linked-life cast is deterministic and ages alongside the player', () => {
    const origin = generateLifeOrigin('cast-seed', 2000);
    const castA = generateP003CoreCast('cast-seed', origin);
    const castB = generateP003CoreCast('cast-seed', origin);
    expect(castA).toEqual(castB);
    expect(castA.every((character) => character.narrativeKernel)).toBe(true);
    const caregiver = castA.find((character) => character.id === 'primary-caregiver');
    expect(caregiver).toBeDefined();
    const ageAt5 = caregiver
      ? characterAgeAtPlayerAge(caregiver, 2000, 5)
      : undefined;
    const ageAt45 = caregiver
      ? characterAgeAtPlayerAge(caregiver, 2000, 45)
      : undefined;
    expect(ageAt5).toBeDefined();
    expect(ageAt45).toBe((ageAt5 ?? 0) + 40);
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
