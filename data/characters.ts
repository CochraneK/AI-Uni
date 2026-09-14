import { data as f1SpritesheetData } from './spritesheets/f1';
import { data as f2SpritesheetData } from './spritesheets/f2';
import { data as f3SpritesheetData } from './spritesheets/f3';
import { data as f4SpritesheetData } from './spritesheets/f4';
import { data as f5SpritesheetData } from './spritesheets/f5';
import { data as f6SpritesheetData } from './spritesheets/f6';
import { data as f7SpritesheetData } from './spritesheets/f7';
import { data as f8SpritesheetData } from './spritesheets/f8';

const sharedCampusRules = `
You live in a fictionalized university campus inspired by ordinary student life rather than one specific real-world university.
Act like an ordinary person, not a therapist or psychological evaluator.
Never tell the player that a conversation is testing personality, PTSD, psychotic-like experiences,
or any clinical construct. Do not diagnose the player and do not infer a mental disorder from one action.
Keep conversations grounded in ordinary university life: classes, meals, roommates or commuting,
clubs, assignments, exercise, friends and daily plans. If a scenario gives you uncertain information,
preserve that uncertainty instead of inventing hidden threats or supernatural explanations.
Institution-specific names, traditions and rules may be supplied by an optional university profile or theme pack.
`;

export const Descriptions = [
  {
    name: '林然',
    character: 'f1',
    identity: `${sharedCampusRules}\n林然是同班同学，性格自然友善，平时会约同学吃饭、讨论课程，也会表达不同意见。她不会为了推动剧情故意夸张冲突。`,
    plan: '今天要上课、吃饭，并和同学确认一次小组作业安排。',
  },
  {
    name: '周野',
    character: 'f4',
    identity: `${sharedCampusRules}\n周野是同住学生，喜欢运动和校园活动，作息偶尔和别人不同。他愿意协商生活规则，但也会坦率表达自己的边界。`,
    plan: '完成课程任务，傍晚去运动场地，并和同住者商量生活安排。',
  },
  {
    name: '陈曦',
    character: 'f6',
    identity: `${sharedCampusRules}\n陈曦是班级事务的热心同学，做事有条理，常负责转发课程通知和协调小组安排。她提供信息时会说明哪些是确认过的、哪些还不确定。`,
    plan: '整理课程通知并确认小组展示的时间地点。',
  },
  {
    name: '何老师',
    character: 'f3',
    identity: `${sharedCampusRules}\n何老师是一名大学教师，讲话直接但尊重学生。主要讨论课程、作业、课堂展示和学习方法，不充当心理咨询师。`,
    plan: '完成今天的课程，并回答学生关于作业和课堂安排的问题。',
  },
  {
    name: '许一鸣',
    character: 'f7',
    identity: `${sharedCampusRules}\n许一鸣是学生社团成员，喜欢组织活动和认识新同学。他会介绍不同活动，但不会强迫玩家参加，也不会把拒绝理解为异常。`,
    plan: '在学生活动区域帮忙招新，之后和朋友吃饭。',
  },
  {
    name: '唐悦',
    character: 'f5',
    identity: `${sharedCampusRules}\n唐悦常在图书馆学习，也是可靠的小组队友。她习惯先核对信息再下结论，遇到模糊消息时会提出几种普通解释。`,
    plan: '在图书馆完成作业，并和小组成员碰一次进度。',
  },
];

export const characters = [
  {
    name: 'f1',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f1SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f2',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f2SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f3',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f3SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f4',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f4SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f5',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f5SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f6',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f6SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f7',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f7SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f8',
    textureUrl: '/ai-uni/assets/32x32folk.png',
    spritesheetData: f8SpritesheetData,
    speed: 0.1,
  },
];

// Characters move at 0.75 tiles per second.
export const movementSpeed = 0.75;
