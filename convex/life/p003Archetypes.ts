import type {
  P003CharacterArcType,
  P003CharacterNarrativeKernel,
  P003CharacterValueId,
} from './p003Characters';
import type { RelationshipType } from './types';

export type P003NarrativeArchetype = {
  key: string;
  name: string;
  oneLiner: string;
  weight: number;
  roleAffinities: RelationshipType[];
  valueAffinities: P003CharacterValueId[];
  formativePressures: string[];
  compensatoryStrategies: string[];
  developmentalNeeds: string[];
  coreDesires: string[];
  coreFears: string[];
  typicalArcs: P003CharacterArcType[];
  arcQuestions: string[];
};

export const p003NarrativeArchetypes: P003NarrativeArchetype[] = [
  {
    key: 'duty_bearer',
    name: '责任承载型',
    oneLiner: '习惯先把事情扛住，再考虑自己有没有余力。',
    weight: 1.2,
    roleAffinities: ['parent', 'caregiver', 'sibling', 'coworker', 'manager'],
    valueAffinities: ['care', 'stability', 'achievement'],
    formativePressures: [
      '很早就被期待成为“懂事、可靠”的那个人',
      '家庭或团队在关键时期缺少稳定承担者',
      '一次没有及时承担责任的经历留下了长期自责',
    ],
    compensatoryStrategies: [
      '主动接过更多责任，以此维持秩序和价值感',
      '在别人开口前先解决问题，避免局面失控',
      '把“我还能扛”当成自己是否安全的证明',
    ],
    developmentalNeeds: [
      '学习区分责任感与过度承担',
      '允许自己被帮助，而不是永远做唯一的支点',
      '接受暂时做不到并不等于失去价值',
    ],
    coreDesires: ['可靠地照顾重要的人和事', '让重要关系保持稳定'],
    coreFears: ['因为自己的缺席让别人受损', '一旦停下来局面就会失控'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      'TA 能不能在承担责任的同时保留自己的边界？',
      '什么时候“负责”会变成“替别人活”？',
    ],
  },
  {
    key: 'achievement_prover',
    name: '成就证明型',
    oneLiner: '通过结果、能力和持续进步确认自己的位置。',
    weight: 1.1,
    roleAffinities: ['peer', 'friend', 'teacher', 'mentor', 'coworker', 'manager'],
    valueAffinities: ['achievement', 'status', 'creativity'],
    formativePressures: [
      '重要评价长期围绕成绩、表现或产出',
      '曾在比较中感到只有“做得足够好”才会被看见',
      '一次失败改变了TA对自己价值的判断',
    ],
    compensatoryStrategies: [
      '不断设定下一个目标，让自己保持可证明的优秀',
      '通过忙碌和产出避免面对停下来后的不确定',
      '在竞争或比较出现时迅速提高标准',
    ],
    developmentalNeeds: [
      '把自我价值和单次结果分开',
      '允许生活里存在无法量化的价值',
      '学会在关系中不靠表现换取位置',
    ],
    coreDesires: ['被认可为有能力的人', '拥有可掌控的成长轨迹'],
    coreFears: ['被证明平庸或无足轻重', '失去已经建立的能力身份'],
    typicalArcs: ['positive_change', 'negative_change', 'open'],
    arcQuestions: [
      '如果没有成绩和头衔，TA还会怎样定义自己？',
      'TA会把竞争转化为成长，还是被它吞没？',
    ],
  },
  {
    key: 'belonging_keeper',
    name: '归属维系型',
    oneLiner: '很会察觉关系变化，也愿意为“我们还在一起”做很多事。',
    weight: 1.1,
    roleAffinities: ['caregiver', 'parent', 'sibling', 'peer', 'friend', 'close_friend', 'romantic_partner', 'spouse'],
    valueAffinities: ['belonging', 'care', 'stability'],
    formativePressures: [
      '成长中经历过重要关系的分离或迁移',
      '家庭或同伴环境让“被留下”成为很重要的安全来源',
      '曾经需要主动调和冲突来维持群体完整',
    ],
    compensatoryStrategies: [
      '优先照顾关系气氛，避免冲突升级',
      '主动维持联系，以减少关系自然疏远的可能',
      '在重要的人变远时投入更多精力拉近距离',
    ],
    developmentalNeeds: [
      '接受关系会变化但不等于自己被否定',
      '建立能容纳分歧和距离的连接方式',
      '区分真诚靠近与为了不失去而过度迁就',
    ],
    coreDesires: ['拥有稳定而真实的归属', '重要关系可以经得起变化'],
    coreFears: ['被排除或被遗忘', '关系一旦有裂缝就再也修不好'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      'TA能不能允许关系变化，而不把变化解释为抛弃？',
      'TA会在维持关系和保留自己之间找到什么边界？',
    ],
  },
  {
    key: 'self_directed_explorer',
    name: '自主探索型',
    oneLiner: '更愿意亲自试一条路，再决定它是不是自己的。',
    weight: 1.0,
    roleAffinities: ['peer', 'friend', 'close_friend', 'romantic_partner', 'coworker', 'community'],
    valueAffinities: ['autonomy', 'curiosity', 'freedom', 'creativity'],
    formativePressures: [
      '成长环境里存在较强的既定路线或期待',
      '一次自主决定带来了明显的掌控感',
      '曾发现“别人认为适合的路”并不适合自己',
    ],
    compensatoryStrategies: [
      '优先保留选项，不轻易做不可逆承诺',
      '通过尝试新环境确认自己的边界和兴趣',
      '遇到强控制时更强调个人决定权',
    ],
    developmentalNeeds: [
      '理解承诺不一定等于失去自由',
      '学会把探索转化为能够长期建设的方向',
      '在自主与互相依赖之间建立弹性',
    ],
    coreDesires: ['按自己的方式生活', '持续拥有选择和探索空间'],
    coreFears: ['被固定角色或期待困住', '为了安全而失去自己'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      '什么时候自由会变成逃避承诺？',
      'TA能否在选择一条路后仍保持自主感？',
    ],
  },
  {
    key: 'security_builder',
    name: '安全建构型',
    oneLiner: '更相信准备、秩序和可预期性能够保护重要生活。',
    weight: 1.0,
    roleAffinities: ['caregiver', 'parent', 'teacher', 'coworker', 'manager', 'romantic_partner', 'spouse'],
    valueAffinities: ['security', 'stability', 'achievement'],
    formativePressures: [
      '成长中经历过资源、住房或家庭安排的不稳定',
      '一次突发变化强化了TA对准备和秩序的重视',
      '重要大人经常把“提前准备”当成安全原则',
    ],
    compensatoryStrategies: [
      '提前规划并准备备选方案',
      '优先选择风险较低、边界清楚的路径',
      '在不确定上升时增加检查、安排和控制',
    ],
    developmentalNeeds: [
      '区分有用准备和过度控制',
      '学习在不确定中保留行动能力',
      '允许一些关系和生活环节保持开放',
    ],
    coreDesires: ['让自己和重要的人拥有稳定基础', '对未来保有基本可预期性'],
    coreFears: ['突然失去关键资源或秩序', '来不及准备就被变化推着走'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      'TA会用秩序创造安全，还是被秩序限制？',
      '面对无法准备的变化，TA会怎样调整？',
    ],
  },
  {
    key: 'repair_seeker',
    name: '修复寻路型',
    oneLiner: '不太容易忘记裂痕，但也不轻易相信裂痕只能以离开结束。',
    weight: 0.9,
    roleAffinities: ['parent', 'sibling', 'friend', 'close_friend', 'romantic_partner', 'spouse', 'coworker'],
    valueAffinities: ['fairness', 'care', 'belonging'],
    formativePressures: [
      '曾经经历过重要关系冲突，却又不得不继续相处',
      '看见过关系因为长期不沟通而逐渐破裂',
      '一次真诚修复的经历改变了TA对冲突的看法',
    ],
    compensatoryStrategies: [
      '冲突后寻找解释和重新连接的机会',
      '把公平和“把话说清楚”看得很重',
      '会反复回看争执细节，寻找哪里还可以修',
    ],
    developmentalNeeds: [
      '接受不是所有关系都必须修复',
      '区分修复、原谅和重新允许伤害发生',
      '学会在修复关系时保护自己的边界',
    ],
    coreDesires: ['重要关系能够经得起冲突', '被认真理解而不是被简单判定'],
    coreFears: ['误解永久定型', '一段重要关系在没说清楚前结束'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      'TA会修复关系，还是困在反复解释里？',
      '什么时候离开反而是更完整的修复？',
    ],
  },
  {
    key: 'quiet_observer',
    name: '安静观察型',
    oneLiner: '先看懂环境和别人，再决定自己要不要进入。',
    weight: 1.0,
    roleAffinities: ['peer', 'friend', 'teacher', 'mentor', 'coworker', 'community'],
    valueAffinities: ['curiosity', 'autonomy', 'security'],
    formativePressures: [
      '早期环境让观察比抢先表达更安全或更有效',
      '曾因过快表态而付出代价',
      '在复杂群体中学会先判断规则再行动',
    ],
    compensatoryStrategies: [
      '进入新环境时先观察关系和规则',
      '重要决定前积累信息，不急于暴露立场',
      '在冲突中先退到分析位置',
    ],
    developmentalNeeds: [
      '在信息不完整时也能做决定',
      '让重要的人知道自己的真实立场',
      '避免把观察变成长期不参与',
    ],
    coreDesires: ['看清楚之后再行动', '保留独立判断空间'],
    coreFears: ['在不了解局面时做出不可逆选择', '暴露自己后失去回旋空间'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      '什么时候谨慎观察会变成错过参与？',
      'TA会在什么关系里愿意更早表达自己？',
    ],
  },
  {
    key: 'contribution_maker',
    name: '贡献创造型',
    oneLiner: '需要感觉自己的时间和能力正在留下某种有意义的东西。',
    weight: 0.9,
    roleAffinities: ['teacher', 'mentor', 'manager', 'parent', 'community', 'coworker'],
    valueAffinities: ['contribution', 'creativity', 'care', 'achievement'],
    formativePressures: [
      '曾被某个重要人物的帮助长期影响',
      '经历过“只为自己努力”仍然感到空洞的阶段',
      '在照顾、教学或创造中第一次感到自己能留下影响',
    ],
    compensatoryStrategies: [
      '主动寻找能产生长期影响的项目或关系',
      '把经验整理成可以交给下一代的东西',
      '在人生转折期重新寻找“我还能贡献什么”',
    ],
    developmentalNeeds: [
      '接受贡献不一定需要宏大的成果',
      '允许自己的价值不完全依赖他人是否受益',
      '把传承与自己的生活满足放在同一张地图上',
    ],
    coreDesires: ['留下真实而可持续的影响', '让经验不只是消失在自己这里'],
    coreFears: ['一生忙碌却没有真正留下什么', '失去角色后也失去意义'],
    typicalArcs: ['positive_change', 'flat', 'open'],
    arcQuestions: [
      'TA会把贡献变成新的绩效压力，还是找到更宽的意义？',
      '当原来的角色结束，TA会把经验带去哪里？',
    ],
  },
];

const hash01 = (input: string) => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const pick = <T>(items: T[], seed: string): T =>
  items[Math.min(items.length - 1, Math.floor(hash01(seed) * items.length))];

export const selectP003NarrativeArchetype = (
  seed: string,
  role: RelationshipType,
): P003NarrativeArchetype => {
  const candidates = p003NarrativeArchetypes.filter(
    (item) => item.roleAffinities.includes(role),
  );
  const pool = candidates.length > 0 ? candidates : p003NarrativeArchetypes;
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let cursor = hash01(`${seed}:archetype`) * total;
  for (const item of pool) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }
  return pool[pool.length - 1];
};

export const instantiateP003NarrativeKernel = (
  seed: string,
  role: RelationshipType,
): P003CharacterNarrativeKernel => {
  const archetype = selectP003NarrativeArchetype(seed, role);
  return {
    archetypeKey: archetype.key,
    archetypeName: archetype.name,
    oneLiner: archetype.oneLiner,
    formativePressure: pick(archetype.formativePressures, `${seed}:pressure`),
    compensatoryStrategy: pick(archetype.compensatoryStrategies, `${seed}:strategy`),
    developmentalNeed: pick(archetype.developmentalNeeds, `${seed}:need`),
    coreDesire: pick(archetype.coreDesires, `${seed}:desire`),
    coreFear: pick(archetype.coreFears, `${seed}:fear`),
    arcType: pick(archetype.typicalArcs, `${seed}:arc`),
    arcQuestion: pick(archetype.arcQuestions, `${seed}:question`),
    source: 'p003_archetype_grid',
  };
};

export const enrichCharacterWithNarrativeKernel = (
  character: {
    id: string;
    relationshipRole: RelationshipType;
    values: P003CharacterValueId[];
  },
  seed: string,
) => {
  const kernel = instantiateP003NarrativeKernel(
    `${seed}:${character.id}`,
    character.relationshipRole,
  );
  const archetype = p003NarrativeArchetypes.find(
    (item) => item.key === kernel.archetypeKey,
  );
  const values = [
    ...character.values,
    ...(archetype?.valueAffinities ?? []),
  ];
  return {
    narrativeKernel: kernel,
    values: [...new Set(values)].slice(0, 5),
  };
};

export const p003ArchetypeGridPrinciple =
  'Borrowed from AI-persona engineering: deep narrative identities come from a finite auditable grid, while surface details may vary freely. P003 archetypes are non-clinical writing structures, not diagnoses or personality types.';
