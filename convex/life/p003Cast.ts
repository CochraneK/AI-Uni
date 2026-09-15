import type { LifeOriginSnapshot, RelationshipType } from './types';
import type { P003CharacterBlueprint } from './p003Characters';
import type { P003Storylet } from './p003Storylets';
import { enrichCharacterWithNarrativeKernel } from './p003Archetypes';

const names = ['林然', '周宁', '陈安', '许澄', '王禾', '赵青', '沈知', '李言', '苏遥', '唐予'];

const hash01 = (input: string) => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const pickName = (seed: string, key: string, offset = 0) =>
  names[(Math.floor(hash01(`${seed}:${key}`) * names.length) + offset) % names.length];

const adultAgeAtBirth = (seed: string, key: string, min: number, max: number) =>
  Math.round(min + hash01(`${seed}:${key}:age`) * (max - min));

const blueprint = (
  data: P003CharacterBlueprint,
): P003CharacterBlueprint => data;

export const generateP003CoreCast = (
  seed: string,
  origin: LifeOriginSnapshot,
): P003CharacterBlueprint[] => {
  const primaryCaregiverAge = adultAgeAtBirth(seed, 'primary-caregiver', 22, 38);
  const secondaryCaregiverAge = adultAgeAtBirth(seed, 'secondary-caregiver', 23, 42);
  const cast: P003CharacterBlueprint[] = [
    blueprint({
      id: 'primary-caregiver',
      displayName: pickName(seed, 'primary-caregiver'),
      relationshipRole: 'parent',
      birthYear: origin.birthYear - primaryCaregiverAge,
      socialRoles: ['parent', 'caregiver'],
      visibleWant: '让家庭保持可运转，也希望你过得好',
      underlyingNeed: '在照顾别人和保留自己的人生之间找到位置',
      fearOrAvoidance: '家庭失控，或者重要的人渐渐不再需要自己',
      values: ['care', 'security', 'stability'],
      contradictions: [
        {
          poleA: '愿意为家人投入很多',
          poleB: '压力大时可能替别人做决定',
          pressurePoint: '你的路线与家庭期待不一致时',
        },
      ],
      resources: ['家庭经验', '对你的长期了解'],
      constraints: ['自己的工作、健康和家庭责任也会变化'],
      privateFacts: [],
      arcThreads: [
        {
          id: 'care-vs-control',
          question: '照顾一个人，和替一个人决定，边界在哪里？',
          status: 'latent',
        },
      ],
    }),
    blueprint({
      id: 'childhood-peer',
      displayName: pickName(seed, 'childhood-peer', 1),
      relationshipRole: 'friend',
      birthYear: origin.birthYear,
      socialRoles: ['peer', 'friend', 'close_friend'],
      visibleWant: '找到能一起玩、一起长大又不必完全一样的人',
      underlyingNeed: '在归属感和保持自己之间建立稳定关系',
      fearOrAvoidance: '被群体落下，或为了合群失去自己',
      values: ['belonging', 'fairness', 'curiosity'],
      contradictions: [
        {
          poleA: '很在意朋友',
          poleB: '遇到变化时也可能突然把注意力转去自己的新生活',
          pressurePoint: '升学、搬家和新的朋友圈出现时',
        },
      ],
      resources: ['共同成长的记忆'],
      constraints: ['TA 也有自己的家庭、学校和机会结构'],
      privateFacts: [],
      arcThreads: [
        {
          id: 'growing-apart-or-together',
          question: '一起长大的人，长大后还会不会走在同一条路上？',
          status: 'latent',
        },
      ],
    }),
    blueprint({
      id: 'school-teacher',
      displayName: `${pickName(seed, 'teacher', 2)}老师`,
      relationshipRole: 'teacher',
      birthYear: origin.birthYear - adultAgeAtBirth(seed, 'teacher', 24, 45),
      socialRoles: ['teacher', 'mentor'],
      visibleWant: '让班级能够运转，也希望学生真正学会东西',
      underlyingNeed: '确认自己的投入不是只换来分数和秩序',
      fearOrAvoidance: '失去课堂控制，或无法帮助真正需要支持的学生',
      values: ['achievement', 'fairness', 'contribution'],
      contradictions: [
        {
          poleA: '重视学生差异',
          poleB: '忙起来时也会依赖统一规则',
          pressurePoint: '资源不足和评价压力同时出现时',
        },
      ],
      resources: ['学校信息', '制度经验'],
      constraints: ['班级规模', '学校资源', '评价体系'],
      privateFacts: [],
      arcThreads: [],
    }),
    blueprint({
      id: 'adult-coworker',
      displayName: pickName(seed, 'coworker', 3),
      relationshipRole: 'coworker',
      birthYear: origin.birthYear - adultAgeAtBirth(seed, 'coworker', -3, 8),
      socialRoles: ['coworker', 'friend'],
      visibleWant: '把工作做好，同时别让工作吞掉全部生活',
      underlyingNeed: '获得可信的合作关系和可预期的边界',
      fearOrAvoidance: '背锅、失控和无止境的额外责任',
      values: ['fairness', 'security', 'freedom'],
      contradictions: [
        {
          poleA: '愿意互相帮忙',
          poleB: '触及自己的风险边界时会迅速自保',
          pressurePoint: '组织冲突和责任归属不清时',
        },
      ],
      resources: ['组织内部信息', '同事网络'],
      constraints: ['自己的职位和风险'],
      privateFacts: [],
      arcThreads: [],
    }),
    blueprint({
      id: 'adult-manager',
      displayName: `${pickName(seed, 'manager', 4)}经理`,
      relationshipRole: 'manager',
      birthYear: origin.birthYear - adultAgeAtBirth(seed, 'manager', 8, 22),
      socialRoles: ['manager'],
      visibleWant: '完成组织目标并保持控制',
      underlyingNeed: '证明自己能够承担责任和不确定性',
      fearOrAvoidance: '失去权威或暴露自己无法控制局面',
      values: ['achievement', 'status', 'security'],
      contradictions: [
        {
          poleA: '希望团队表现好',
          poleB: '压力下可能把短期结果放在关系和公平之前',
          pressurePoint: '上级施压或项目失控时',
        },
      ],
      resources: ['正式权力', '信息优势'],
      constraints: ['组织目标', '上级评价'],
      privateFacts: [],
      arcThreads: [],
    }),
  ];

  if (origin.caregiverCount > 1) {
    cast.push(
      blueprint({
        id: 'secondary-caregiver',
        displayName: pickName(seed, 'secondary-caregiver', 5),
        relationshipRole: 'parent',
        birthYear: origin.birthYear - secondaryCaregiverAge,
        socialRoles: ['parent', 'caregiver'],
        visibleWant: '在家庭中承担自己的部分，也保留个人空间',
        underlyingNeed: '被看见的不只是“家庭角色”',
        fearOrAvoidance: '长期责任失衡',
        values: ['care', 'autonomy', 'stability'],
        contradictions: [
          {
            poleA: '愿意承担责任',
            poleB: '感到不公平时可能迅速退出沟通',
            pressurePoint: '家庭分工长期失衡时',
          },
        ],
        resources: ['第二套家庭视角'],
        constraints: ['自己的工作和关系需求'],
        privateFacts: [],
        arcThreads: [],
      }),
    );
  }

  if (hash01(`${seed}:sibling`) > 0.45) {
    cast.push(
      blueprint({
        id: 'sibling',
        displayName: pickName(seed, 'sibling', 6),
        relationshipRole: 'sibling',
        birthYear: origin.birthYear + (hash01(`${seed}:sibling:older`) > 0.5 ? -3 : 3),
        socialRoles: ['sibling'],
        visibleWant: '在同一个家庭里拥有属于自己的位置',
        underlyingNeed: '既能与家人连接，又不被比较定义',
        fearOrAvoidance: '永远活在另一个手足的参照里',
        values: ['belonging', 'autonomy', 'fairness'],
        contradictions: [
          {
            poleA: '知道你们共享很多历史',
            poleB: '也会为了资源、关注和责任产生竞争',
            pressurePoint: '成绩、照护与家庭资源分配时',
          },
        ],
        resources: ['共同家庭记忆'],
        constraints: ['共享但不完全相同的家庭位置'],
        privateFacts: [],
        arcThreads: [],
      }),
    );
  }

  return cast.map((character) => {
    const enrichment = enrichCharacterWithNarrativeKernel(character, seed);
    return {
      ...character,
      values: enrichment.values,
      narrativeKernel: enrichment.narrativeKernel,
      arcThreads: [
        ...character.arcThreads,
        {
          id: `archetype:${enrichment.narrativeKernel.archetypeKey}`,
          question: enrichment.narrativeKernel.arcQuestion,
          status: 'latent' as const,
        },
      ],
    };
  });
};

export const characterAgeAtPlayerAge = (
  character: P003CharacterBlueprint,
  playerBirthYear: number,
  playerAge: number,
) =>
  character.birthYear === undefined
    ? undefined
    : Math.max(0, Math.floor(playerBirthYear + playerAge - character.birthYear));

const roleMatches = (
  character: P003CharacterBlueprint,
  role: RelationshipType,
) =>
  character.relationshipRole === role || character.socialRoles.includes(role);

export const resolveP003StoryletCast = (
  storylet: P003Storylet,
  cast: P003CharacterBlueprint[],
) => {
  const resolved: P003CharacterBlueprint[] = [];
  for (const role of storylet.castSlots) {
    const candidate = cast.find(
      (character) =>
        roleMatches(character, role) &&
        !resolved.some((item) => item.id === character.id),
    );
    if (candidate) resolved.push(candidate);
  }
  return resolved;
};

export const p003LinkedLivesBoundary =
  'Recurring characters age alongside the player and retain their own goals, constraints and arc threads. Cast resolution fills scene roles from persistent people rather than generating disposable test characters.';
