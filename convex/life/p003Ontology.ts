import type { LifeEventCategory, LifeSeasonId } from './types';

export type P003LifeDomainId =
  | 'health_body'
  | 'self_identity'
  | 'family_kinship'
  | 'friendship_social'
  | 'intimacy'
  | 'education_learning'
  | 'work_career'
  | 'material_life'
  | 'community_society'
  | 'meaning_creation';

export type P003LifeStageBandId =
  | 'origin'
  | 'early_childhood'
  | 'middle_childhood'
  | 'adolescence'
  | 'emerging_adulthood'
  | 'early_adulthood'
  | 'middle_adulthood'
  | 'later_adulthood'
  | 'late_life';

export type P003NarrativeFunctionId =
  | 'establish_world'
  | 'reveal_character'
  | 'test_value'
  | 'relationship_move'
  | 'opportunity'
  | 'pressure'
  | 'reversal'
  | 'loss'
  | 'commitment'
  | 'repair'
  | 'payoff'
  | 'reflection';

export type P003NarrativeTechniqueId =
  | 'setup'
  | 'foreshadowing'
  | 'callback'
  | 'escalation'
  | 'contrast'
  | 'reveal'
  | 'delayed_consequence'
  | 'choice_echo';

export type P003LifeDomainDefinition = {
  id: P003LifeDomainId;
  label: string;
  includes: string[];
  excludes: string[];
};

export const p003LifeDomains: Record<P003LifeDomainId, P003LifeDomainDefinition> = {
  health_body: {
    id: 'health_body',
    label: '身体与健康',
    includes: ['身体状态', '疾病与恢复', '睡眠', '生理变化', '功能能力'],
    excludes: ['情绪调节本身', '职业压力本身'],
  },
  self_identity: {
    id: 'self_identity',
    label: '自我与身份',
    includes: ['自主', '价值探索', '身份承诺', '自我定义', '兴趣'],
    excludes: ['具体学校制度', '具体亲密关系'],
  },
  family_kinship: {
    id: 'family_kinship',
    label: '家庭与亲属',
    includes: ['照护者', '手足', '代际关系', '家庭规则', '家庭照护'],
    excludes: ['伴侣关系', '普通朋友关系'],
  },
  friendship_social: {
    id: 'friendship_social',
    label: '朋友与社会关系',
    includes: ['朋友', '同伴', '社交网络', '归属', '互惠'],
    excludes: ['恋爱伴侣', '家庭亲属'],
  },
  intimacy: {
    id: 'intimacy',
    label: '亲密关系',
    includes: ['恋爱', '伴侣', '婚姻', '亲密承诺', '分手与修复'],
    excludes: ['一般友情', '亲子关系'],
  },
  education_learning: {
    id: 'education_learning',
    label: '学习与教育',
    includes: ['学校', '考试', '技能学习', '升学', '教育机会'],
    excludes: ['正式职业角色', '纯兴趣活动'],
  },
  work_career: {
    id: 'work_career',
    label: '工作与职业',
    includes: ['职业探索', '组织关系', '工作角色', '失业', '职业转换'],
    excludes: ['学校教育', '家庭照护劳动的关系层'],
  },
  material_life: {
    id: 'material_life',
    label: '金钱、住房与物质生活',
    includes: ['收入', '财富', '住房', '消费', '债务', '物质安全'],
    excludes: ['宏观制度本身', '职业身份本身'],
  },
  community_society: {
    id: 'community_society',
    label: '社区、制度与社会环境',
    includes: ['社区', '地区', '制度资源', '历史时期', '文化与社会机会结构'],
    excludes: ['个人价值本身', '单一家庭互动'],
  },
  meaning_creation: {
    id: 'meaning_creation',
    label: '兴趣、创造、意义与贡献',
    includes: ['创造', '贡献', '传承', '生成感', '人生回顾', '意义建构'],
    excludes: ['单纯职业绩效', '单纯休闲恢复'],
  },
};

export type P003StageBandDefinition = {
  id: P003LifeStageBandId;
  label: string;
  ageRange: [number, number];
  seasonHints: LifeSeasonId[];
};

export const p003StageBands: P003StageBandDefinition[] = [
  { id: 'origin', label: '生命起点', ageRange: [0, 1], seasonHints: ['origin'] },
  { id: 'early_childhood', label: '幼儿期', ageRange: [2, 5], seasonHints: ['early_childhood'] },
  { id: 'middle_childhood', label: '儿童期', ageRange: [6, 11], seasonHints: ['school_age'] },
  { id: 'adolescence', label: '青春期', ageRange: [12, 17], seasonHints: ['adolescence'] },
  { id: 'emerging_adulthood', label: '成年初显期', ageRange: [18, 24], seasonHints: ['emerging_adulthood'] },
  { id: 'early_adulthood', label: '成年早期', ageRange: [25, 39], seasonHints: ['early_adulthood', 'early_career', 'partnership_family'] },
  { id: 'middle_adulthood', label: '成年中期', ageRange: [40, 59], seasonHints: ['middle_adulthood', 'midlife'] },
  { id: 'later_adulthood', label: '成年后期', ageRange: [60, 74], seasonHints: ['later_adulthood', 'later_career', 'retirement'] },
  { id: 'late_life', label: '晚年', ageRange: [75, 100], seasonHints: ['retirement', 'life_review'] },
];

export const stageBandForAge = (age: number): P003LifeStageBandId =>
  p003StageBands.find((stage) => age >= stage.ageRange[0] && age <= stage.ageRange[1])?.id ??
  (age < 0 ? 'origin' : 'late_life');

export const legacyCategoryPrimaryDomain: Record<LifeEventCategory, P003LifeDomainId> = {
  birth: 'family_kinship',
  caregiving: 'family_kinship',
  play: 'self_identity',
  school: 'education_learning',
  milestone: 'self_identity',
  neighborhood: 'community_society',
  education: 'education_learning',
  exam: 'education_learning',
  holiday: 'family_kinship',
  relationship: 'friendship_social',
  family: 'family_kinship',
  career: 'work_career',
  financial: 'material_life',
  health: 'health_body',
  relocation: 'material_life',
  bereavement: 'family_kinship',
  achievement: 'self_identity',
  failure: 'self_identity',
  social: 'friendship_social',
  historical_context: 'community_society',
  retirement: 'meaning_creation',
};

export const p003OntologyBoundary =
  'Every storylet has exactly one primary life domain, one primary narrative function and one MECE age band. Cross-domain effects are tags, not competing primary classifications.';
