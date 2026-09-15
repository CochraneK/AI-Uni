import { lifeStages as legacyLifeStages } from './development';
import type { LifeChapterDefinition, LifeStageDefinition } from './types';

export const p003EarlyLifeStages: LifeStageDefinition[] = [
  {
    id: 'infancy_foundations',
    label: '婴幼儿期：照护、安全与调节',
    typicalAgeRange: [0, 2],
    eriksonInspiredTheme: '信任与基础调节（仅作为叙事主题）',
    tasks: [
      {
        id: 'caregiving_security',
        label: '稳定照护',
        description: '通过重复的回应、安抚和日常节律建立对环境与照护者的基本可预测感。',
        optional: false,
      },
      {
        id: 'basic_regulation',
        label: '基础调节',
        description: '在睡眠、饥饿、刺激和安抚之间逐渐形成可恢复的节律。',
        optional: false,
      },
    ],
    notes: ['早期照护影响后续概率，但绝不把婴幼儿经历写成成年命运。'],
  },
  {
    id: 'early_childhood_autonomy',
    label: '幼儿期：自主、游戏与边界',
    typicalAgeRange: [2, 6],
    eriksonInspiredTheme: '自主与主动性（作为可反复修正的发展主题）',
    tasks: [
      {
        id: 'autonomy_skills',
        label: '自主技能',
        description: '逐渐学习表达需要、做小决定、承担适龄任务并面对限制。',
        optional: false,
      },
      {
        id: 'play_exploration',
        label: '游戏与探索',
        description: '通过游戏、想象、模仿和尝试形成兴趣与环境理解。',
        optional: false,
      },
      {
        id: 'basic_regulation',
        label: '情绪与行为调节',
        description: '在成人支持下学习等待、命名体验和从挫折中恢复。',
        optional: false,
      },
    ],
    notes: ['不把“听话”当成唯一良好结果，也不把活跃或谨慎直接人格化。'],
  },
  {
    id: 'middle_childhood_competence',
    label: '儿童期：学习、同伴与胜任感',
    typicalAgeRange: [6, 12],
    eriksonInspiredTheme: '勤奋与胜任（作为学习和社会经验的叙事主题）',
    tasks: [
      {
        id: 'learning_foundations',
        label: '学习基础',
        description: '在不同资源条件下发展读写、数理、兴趣和学习策略。',
        optional: false,
      },
      {
        id: 'peer_belonging',
        label: '同伴归属',
        description: '学习加入群体、合作、冲突、和解与建立友谊。',
        optional: false,
      },
      {
        id: 'school_competence',
        label: '胜任体验',
        description: '从学习、运动、艺术、劳动或其他领域获得“我能学会”的经验。',
        optional: false,
      },
    ],
    notes: ['成绩只是众多能力经验之一；学校资源和家庭机会同样进入模型。'],
  },
  {
    id: 'adolescence_identity',
    label: '青春期：身份、同伴与自主',
    typicalAgeRange: [12, 18],
    eriksonInspiredTheme: '身份探索与自主协商',
    tasks: [
      {
        id: 'adolescent_autonomy',
        label: '青春期自主',
        description: '在家庭规则、同伴关系和个人选择之间扩大自己的决定空间。',
        optional: false,
      },
      {
        id: 'values_exploration',
        label: '价值探索',
        description: '通过群体、兴趣、网络、学校和现实经验形成并修正价值判断。',
        optional: false,
      },
      {
        id: 'identity_exploration',
        label: '身份探索',
        description: '探索学习、职业、关系、生活方式与自我定义。',
        optional: false,
      },
      {
        id: 'peer_belonging',
        label: '同伴与重要关系',
        description: '建立、失去、修复和重新选择重要同伴关系。',
        optional: false,
      },
    ],
    notes: ['青春期不是固定“叛逆期”；冲突、合作与自主程度由关系和环境共同形成。'],
  },
];

export const p003LifeStages: LifeStageDefinition[] = [
  ...p003EarlyLifeStages,
  ...legacyLifeStages,
];

export const p003LifeChapters: LifeChapterDefinition[] = [
  {
    id: 'birth_and_family',
    season: 'origin',
    title: '出生：你来到怎样的世界',
    ageRange: [0, 1],
    timeScale: 'month',
    expectedPlayableUnits: 5,
    developmentalTasks: ['caregiving_security', 'basic_regulation'],
    eventPools: ['birth', 'caregiving', 'milestone', 'family', 'health'],
  },
  {
    id: 'early_childhood',
    season: 'early_childhood',
    title: '幼儿期：第一次说“不”与第一次自己选择',
    ageRange: [2, 5],
    timeScale: 'year',
    expectedPlayableUnits: 6,
    developmentalTasks: ['autonomy_skills', 'play_exploration', 'basic_regulation'],
    eventPools: ['caregiving', 'play', 'milestone', 'family', 'health', 'neighborhood'],
  },
  {
    id: 'primary_school_years',
    season: 'school_age',
    title: '儿童期：学校、朋友与“我擅长什么”',
    ageRange: [6, 11],
    timeScale: 'year',
    expectedPlayableUnits: 8,
    developmentalTasks: ['learning_foundations', 'peer_belonging', 'school_competence'],
    eventPools: ['school', 'social', 'family', 'achievement', 'failure', 'play', 'neighborhood'],
  },
  {
    id: 'adolescence_years',
    season: 'adolescence',
    title: '青春期：我是谁，我要走向哪里',
    ageRange: [12, 17],
    timeScale: 'year',
    expectedPlayableUnits: 8,
    developmentalTasks: ['adolescent_autonomy', 'values_exploration', 'identity_exploration', 'peer_belonging'],
    eventPools: ['school', 'exam', 'social', 'relationship', 'family', 'achievement', 'failure'],
  },
  {
    id: 'launch_into_adulthood',
    season: 'emerging_adulthood',
    title: '成年初显：离开既定路线',
    ageRange: [18, 24],
    timeScale: 'year',
    expectedPlayableUnits: 8,
    developmentalTasks: ['identity_exploration', 'career_exploration', 'autonomy_from_family', 'belonging', 'intimacy'],
    eventPools: ['education', 'career', 'financial', 'relationship', 'relocation', 'social', 'family'],
  },
  {
    id: 'early_adult_building',
    season: 'early_adulthood',
    title: '成年早期：工作、关系与生活结构',
    ageRange: [25, 34],
    timeScale: 'year',
    expectedPlayableUnits: 8,
    developmentalTasks: ['work_competence', 'career_exploration', 'partnership_commitment', 'family_formation'],
    eventPools: ['career', 'financial', 'relationship', 'family', 'health', 'relocation'],
  },
  {
    id: 'middle_adult_responsibility',
    season: 'middle_adulthood',
    title: '成年中期：责任、照护与重新选择',
    ageRange: [35, 54],
    timeScale: 'multi_year',
    expectedPlayableUnits: 9,
    developmentalTasks: ['generativity', 'parenting_or_caregiving', 'care_for_older_generation', 'career_reappraisal'],
    eventPools: ['career', 'family', 'health', 'financial', 'relationship', 'bereavement'],
  },
  {
    id: 'later_adult_transition',
    season: 'later_adulthood',
    title: '成年后期：角色变化与新的取舍',
    ageRange: [55, 69],
    timeScale: 'multi_year',
    expectedPlayableUnits: 7,
    developmentalTasks: ['career_reappraisal', 'retirement_transition', 'social_role_reconstruction', 'meaning_making'],
    eventPools: ['career', 'health', 'family', 'financial', 'bereavement', 'achievement'],
  },
  {
    id: 'p003_retirement_reconstruction',
    season: 'retirement',
    title: '退休与重新组织生活',
    ageRange: [65, 84],
    timeScale: 'multi_year',
    expectedPlayableUnits: 7,
    developmentalTasks: ['retirement_transition', 'social_role_reconstruction', 'meaning_making'],
    eventPools: ['retirement', 'health', 'family', 'social', 'relationship', 'holiday'],
  },
  {
    id: 'p003_life_review',
    season: 'life_review',
    title: '人生回望：那些留下来的东西',
    ageRange: [75, 100],
    timeScale: 'multi_year',
    expectedPlayableUnits: 6,
    developmentalTasks: ['life_review', 'meaning_making', 'generativity'],
    eventPools: ['family', 'relationship', 'social', 'bereavement', 'achievement', 'historical_context'],
  },
];

export const getP003LifeStage = (id: LifeStageDefinition['id']) =>
  p003LifeStages.find((stage) => stage.id === id);

export const getP003LifeChapter = (id: string) =>
  p003LifeChapters.find((chapter) => chapter.id === id);
