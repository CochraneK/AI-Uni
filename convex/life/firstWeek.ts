import type { DevelopmentalTaskId, LifeEventCategory } from './types';

export type FirstWeekDay = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  ordinaryGoals: string[];
  recommendedLocations: string[];
  eventCategories: LifeEventCategory[];
  developmentalTasks: DevelopmentalTaskId[];
  researchDensity: 'low' | 'medium';
  closingBeat: string;
};

export const universityFirstWeek: FirstWeekDay[] = [
  {
    day: 1,
    title: '来到这里',
    ordinaryGoals: ['完成入学报到', '熟悉自己的住宿或通勤安排', '认识至少一名同学', '第一次自由逛校园'],
    recommendedLocations: ['campus_gate', 'dormitory', 'cafeteria'],
    eventCategories: ['education', 'social', 'family'],
    developmentalTasks: ['autonomy_from_family', 'belonging'],
    researchDensity: 'low',
    closingBeat: '第一天结束，新的大学生活开始有了轮廓。',
  },
  {
    day: 2,
    title: '第一次正式上课',
    ordinaryGoals: ['按时找到教室', '完成第一天课程', '和同学一起吃饭或休息'],
    recommendedLocations: ['teaching_building', 'cafeteria', 'library'],
    eventCategories: ['education', 'social'],
    developmentalTasks: ['education_commitment', 'belonging'],
    researchDensity: 'low',
    closingBeat: '开始记住一些人的名字，也开始熟悉学校的节奏。',
  },
  {
    day: 3,
    title: '第一次合作',
    ordinaryGoals: ['加入一次小组任务', '决定分工', '安排下一次碰面'],
    recommendedLocations: ['library', 'teaching_building'],
    eventCategories: ['education', 'social'],
    developmentalTasks: ['education_commitment', 'identity_exploration'],
    researchDensity: 'medium',
    closingBeat: '第一次发现“同学”并不都一样好相处。',
  },
  {
    day: 4,
    title: '试试看别的生活',
    ordinaryGoals: ['看看学生组织、社团或校园活动', '至少探索一个不熟悉的选项', '决定是否继续参加'],
    recommendedLocations: ['student_center', 'sports_field', 'campus_green'],
    eventCategories: ['social', 'relationship'],
    developmentalTasks: ['identity_exploration', 'belonging'],
    researchDensity: 'low',
    closingBeat: '开始形成“我在大学里想过怎样的生活”的想法。',
  },
  {
    day: 5,
    title: '第一次摩擦',
    ordinaryGoals: ['处理一个现实的人际不愉快', '决定要不要表达边界', '继续完成当天生活任务'],
    recommendedLocations: ['cafeteria', 'dormitory', 'library'],
    eventCategories: ['social', 'relationship'],
    developmentalTasks: ['belonging', 'autonomy_from_family'],
    researchDensity: 'medium',
    closingBeat: '一些关系开始靠近，也有一些关系开始拉开距离。',
  },
  {
    day: 6,
    title: '周末出去玩',
    ordinaryGoals: ['和同学决定周末安排', '体验一次校外活动或替代的校园聚会', '处理临时计划变化'],
    recommendedLocations: ['student_center', 'campus_gate'],
    eventCategories: ['holiday', 'social', 'relationship'],
    developmentalTasks: ['identity_exploration', 'intimacy'],
    researchDensity: 'medium',
    closingBeat: '校园之外的人际关系开始延伸。',
  },
  {
    day: 7,
    title: '第一周结束',
    ordinaryGoals: ['自由安排半天', '和一个重要的人重新互动', '整理下周计划'],
    recommendedLocations: ['campus_green', 'library', 'dormitory'],
    eventCategories: ['social', 'family', 'relationship'],
    developmentalTasks: ['identity_exploration', 'belonging', 'education_commitment'],
    researchDensity: 'low',
    closingBeat: '第一周结束；世界不会结算人格分数，而是保留关系、选择、任务与人生历史进入下一章。',
  },
];

export const firstWeekEndCondition = {
  requiredPlayableDays: 7,
  minimumCoreEvents: 3,
  minimumDistinctNpcInteractions: 4,
  requireOrdinaryLifeCompletion: true,
  nextChapterId: 'freshman_year',
} as const;
