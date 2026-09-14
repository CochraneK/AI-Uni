import { defaultUniversityDay, type CampusLocationId } from './config';
import { UNIVERSITY_DAY_END_MINUTE, UNIVERSITY_DAY_START_MINUTE } from '../life/dayClock';

export type UniversityScheduleEntry = {
  minute: number;
  time: string;
  location: CampusLocationId;
  activity: string;
};

export type UniversityScheduleMoment = {
  current?: UniversityScheduleEntry;
  next?: UniversityScheduleEntry;
};

export const parseClockTime = (time: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return undefined;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return undefined;
  return hours * 60 + minutes;
};

export const universityScheduleEntries: UniversityScheduleEntry[] = defaultUniversityDay
  .map((entry) => {
    const minute = parseClockTime(entry.time);
    if (minute === undefined) throw new Error(`Invalid university schedule time: ${entry.time}`);
    return { ...entry, minute };
  })
  .sort((a, b) => a.minute - b.minute);

export const getUniversityScheduleMoment = (minute: number): UniversityScheduleMoment => {
  const normalized = Math.max(
    UNIVERSITY_DAY_START_MINUTE,
    Math.min(UNIVERSITY_DAY_END_MINUTE, Math.round(minute)),
  );

  let current: UniversityScheduleEntry | undefined;
  let next: UniversityScheduleEntry | undefined;

  for (const entry of universityScheduleEntries) {
    if (entry.minute <= normalized) {
      current = entry;
      continue;
    }
    next = entry;
    break;
  }

  return { current, next };
};

export const formatScheduleHint = (moment: UniversityScheduleMoment) => {
  if (!moment.current) return undefined;
  if (!moment.next) return `${moment.current.activity} · ${moment.current.time}`;
  return `${moment.current.activity} · 下一项 ${moment.next.time} ${moment.next.activity}`;
};
