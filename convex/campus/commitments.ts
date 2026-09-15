import type { CampusLocationId } from './config';
import { parseClockTime } from './schedule';

export type CommitmentKind =
  | 'registration'
  | 'class'
  | 'group_meeting'
  | 'club_meeting'
  | 'presentation'
  | 'social_plan'
  | 'exam'
  | 'appointment'
  | 'interview'
  | 'work_shift';

export type ScheduledCommitmentTemplate = {
  key: string;
  chapterId: string;
  chapterUnit: number;
  kind: CommitmentKind;
  title: string;
  locationId: CampusLocationId;
  start: string;
  end: string;
  attendanceRequired: boolean;
  graceMinutes: number;
  description: string;
};

export const firstWeekCommitmentTemplates: ScheduledCommitmentTemplate[] = [
  {
    key: 'first_week_day1_registration',
    chapterId: 'university_first_week',
    chapterUnit: 1,
    kind: 'registration',
    title: '新生报到',
    locationId: 'campus_gate',
    start: '09:00',
    end: '10:00',
    attendanceRequired: true,
    graceMinutes: 15,
    description: '完成第一天的报到和基本入校手续。',
  },
  {
    key: 'first_week_day2_first_class',
    chapterId: 'university_first_week',
    chapterUnit: 2,
    kind: 'class',
    title: '第一节正式课程',
    locationId: 'teaching_building',
    start: '09:00',
    end: '10:30',
    attendanceRequired: true,
    graceMinutes: 10,
    description: '按课程安排参加第一节正式课。',
  },
  {
    key: 'first_week_day3_group_meeting',
    chapterId: 'university_first_week',
    chapterUnit: 3,
    kind: 'group_meeting',
    title: '小组第一次碰面',
    locationId: 'library',
    start: '14:00',
    end: '15:00',
    attendanceRequired: true,
    graceMinutes: 10,
    description: '和课程小组确认分工、联系方式和下一次碰面。',
  },
  {
    key: 'first_week_day4_club_intro',
    chapterId: 'university_first_week',
    chapterUnit: 4,
    kind: 'club_meeting',
    title: '社团说明会',
    locationId: 'student_center',
    start: '17:00',
    end: '18:00',
    attendanceRequired: false,
    graceMinutes: 15,
    description: '一个可选的社团说明会；不去不会被当成失败。',
  },
  {
    key: 'first_week_day5_presentation',
    chapterId: 'university_first_week',
    chapterUnit: 5,
    kind: 'presentation',
    title: '课程短汇报',
    locationId: 'teaching_building',
    start: '14:30',
    end: '15:30',
    attendanceRequired: true,
    graceMinutes: 5,
    description: '按安排完成一次短汇报并听完本组反馈。',
  },
  {
    key: 'first_week_day6_weekend_meetup',
    chapterId: 'university_first_week',
    chapterUnit: 6,
    kind: 'social_plan',
    title: '周末碰面',
    locationId: 'campus_gate',
    start: '18:00',
    end: '18:30',
    attendanceRequired: false,
    graceMinutes: 15,
    description: '和约好的同学在校门口碰面，再决定晚上的安排。',
  },
];

export const materializeCommitmentTemplate = (template: ScheduledCommitmentTemplate) => {
  const startMinute = parseClockTime(template.start);
  const endMinute = parseClockTime(template.end);
  if (startMinute === undefined || endMinute === undefined || startMinute >= endMinute) {
    throw new Error(`Invalid commitment time range for ${template.key}: ${template.start}-${template.end}`);
  }
  return {
    ...template,
    startMinute,
    endMinute,
  };
};

export const materializedFirstWeekCommitments = firstWeekCommitmentTemplates.map(
  materializeCommitmentTemplate,
);
