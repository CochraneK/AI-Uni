import type { CampusLocationId } from '../campus/config';

export type CampusActivity = {
  id: string;
  locationId: CampusLocationId;
  title: string;
  description: string;
  completionText: string;
  estimatedMinutes: number;
  tags: string[];
};

export const campusActivities: CampusActivity[] = [
  {
    id: 'gate_check_noticeboard',
    locationId: 'campus_gate',
    title: '看一眼公告栏',
    description: '看看今天校园里有什么通知、活动或临时变化。',
    completionText: '你在校门附近看了会儿公告，把几件近期活动记在心里。',
    estimatedMinutes: 10,
    tags: ['routine', 'arrival', 'pure-life'],
  },
  {
    id: 'gate_wait_and_watch',
    locationId: 'campus_gate',
    title: '在门口等一会儿',
    description: '不赶时间，只是看看进出校园的人和周围的动静。',
    completionText: '你在校门口待了一会儿，看着人来人往，校园开始显得没那么陌生。',
    estimatedMinutes: 15,
    tags: ['routine', 'leisure', 'pure-life'],
  },
  {
    id: 'teaching_preview_notes',
    locationId: 'teaching_building',
    title: '整理一下课堂笔记',
    description: '找个位置，把刚才的内容和接下来要做的事理一遍。',
    completionText: '你把课堂笔记和待办整理了一遍，接下来要做什么更清楚了。',
    estimatedMinutes: 25,
    tags: ['study', 'routine', 'pure-life'],
  },
  {
    id: 'teaching_find_classroom',
    locationId: 'teaching_building',
    title: '熟悉教学楼',
    description: '沿着楼层和走廊看看常用教室、楼梯和出口。',
    completionText: '你绕着教学楼走了一圈，之后再找教室应该不会那么慌了。',
    estimatedMinutes: 15,
    tags: ['orientation', 'study', 'pure-life'],
  },
  {
    id: 'library_quiet_study',
    locationId: 'library',
    title: '安静自习一会儿',
    description: '找个座位，处理自己的阅读、作业或其他事情。',
    completionText: '你安静做了一会儿自己的事，没有特别剧情，只有一段普通的学习时间。',
    estimatedMinutes: 45,
    tags: ['study', 'routine', 'pure-life'],
  },
  {
    id: 'library_browse_shelves',
    locationId: 'library',
    title: '随便翻翻书',
    description: '没有明确目标地看看书架，遇到感兴趣的就多停一会儿。',
    completionText: '你随手翻了几本书，其中有一本比预想中更有意思。',
    estimatedMinutes: 20,
    tags: ['leisure', 'exploration', 'pure-life'],
  },
  {
    id: 'student_center_check_clubs',
    locationId: 'student_center',
    title: '看看活动海报',
    description: '看看最近有哪些社团、讲座、比赛或志愿活动。',
    completionText: '你浏览了几张海报，至少知道最近校园里都在忙些什么。',
    estimatedMinutes: 15,
    tags: ['social', 'exploration', 'pure-life'],
  },
  {
    id: 'student_center_take_break',
    locationId: 'student_center',
    title: '坐下来歇一会儿',
    description: '暂时什么都不参加，找个位置休息一下。',
    completionText: '你在活动中心坐了一会儿，听着周围断断续续的聊天声。',
    estimatedMinutes: 15,
    tags: ['rest', 'social', 'pure-life'],
  },
  {
    id: 'cafeteria_have_meal',
    locationId: 'cafeteria',
    title: '吃顿饭',
    description: '找个窗口，正常吃完一顿校园餐。',
    completionText: '你吃完了一顿很普通的饭。没发生大事，但大学生活本来就由这些时刻组成。',
    estimatedMinutes: 30,
    tags: ['food', 'routine', 'pure-life'],
  },
  {
    id: 'cafeteria_get_drink',
    locationId: 'cafeteria',
    title: '买点喝的',
    description: '顺手买杯饮料或水，再决定下一站去哪。',
    completionText: '你买了点喝的，在离开食堂前又站了一小会儿。',
    estimatedMinutes: 10,
    tags: ['food', 'routine', 'pure-life'],
  },
  {
    id: 'green_take_walk',
    locationId: 'campus_green',
    title: '随便走走',
    description: '沿着公共空间慢慢走一圈，不需要有明确目的。',
    completionText: '你在校园公共空间慢慢走了一圈，给今天留了一点空白。',
    estimatedMinutes: 25,
    tags: ['leisure', 'movement', 'pure-life'],
  },
  {
    id: 'green_sit_outside',
    locationId: 'campus_green',
    title: '坐一会儿',
    description: '找个舒服的地方坐着，看看周围的人和景。',
    completionText: '你什么也没急着做，只是在外面坐了一会儿。',
    estimatedMinutes: 20,
    tags: ['rest', 'leisure', 'pure-life'],
  },
  {
    id: 'sports_easy_run',
    locationId: 'sports_field',
    title: '慢跑几圈',
    description: '按自己的节奏活动一下，不追求成绩。',
    completionText: '你按自己的速度跑了几圈，身体热起来以后就停了下来。',
    estimatedMinutes: 30,
    tags: ['sports', 'routine', 'pure-life'],
  },
  {
    id: 'sports_watch_game',
    locationId: 'sports_field',
    title: '看会儿球',
    description: '在场边待一会儿，看看别人打球或训练。',
    completionText: '你在场边看了一阵，有几次精彩的配合让周围的人一起叫了起来。',
    estimatedMinutes: 20,
    tags: ['sports', 'leisure', 'pure-life'],
  },
  {
    id: 'dorm_tidy_space',
    locationId: 'dormitory',
    title: '整理自己的位置',
    description: '收拾桌面、床铺或随手堆着的东西。',
    completionText: '你把自己的位置收拾了一遍，空间看起来终于顺眼一些。',
    estimatedMinutes: 25,
    tags: ['home', 'routine', 'pure-life'],
  },
  {
    id: 'dorm_rest',
    locationId: 'dormitory',
    title: '回去休息一下',
    description: '不处理任务，只在自己的住处待一会儿。',
    completionText: '你在住处安静休息了一会儿，让一天的节奏慢了下来。',
    estimatedMinutes: 30,
    tags: ['home', 'rest', 'pure-life'],
  },
];

export const campusActivityById = Object.fromEntries(
  campusActivities.map((activity) => [activity.id, activity]),
) as Record<string, CampusActivity>;

export const getCampusActivities = (locationId?: string) =>
  locationId
    ? campusActivities.filter((activity) => activity.locationId === locationId)
    : [];

export const getCampusActivity = (activityId: string) => campusActivityById[activityId];

export const campusActivityRules = {
  maxDistinctActivitiesPerDay: 3,
  repeatSameActivityPerDay: false,
  countsAsCoreScenario: false,
  countsAsOrdinaryLifeExperience: true,
} as const;
