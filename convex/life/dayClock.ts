export const UNIVERSITY_DAY_START_MINUTE = 8 * 60;
export const UNIVERSITY_DAY_END_MINUTE = 23 * 60;

export type DayClockState = {
  dayKey: string;
  minute: number;
};

export const makeDayClockKey = (profile: {
  chapterId: string;
  chapterUnit: number;
  totalGameDays: number;
}) => `${profile.chapterId}:${profile.chapterUnit}:${profile.totalGameDays}`;

export const clampGameMinute = (minute: number) =>
  Math.min(UNIVERSITY_DAY_END_MINUTE, Math.max(UNIVERSITY_DAY_START_MINUTE, Math.round(minute)));

export const getDayClock = (
  state: any,
  dayKey: string,
): DayClockState => {
  const stored = state?.dayClock;
  if (stored?.dayKey === dayKey && Number.isFinite(stored.minute)) {
    return { dayKey, minute: clampGameMinute(stored.minute) };
  }
  return { dayKey, minute: UNIVERSITY_DAY_START_MINUTE };
};

export const canSpendMinutes = (clock: DayClockState, durationMinutes: number) => {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return false;
  return clock.minute + Math.round(durationMinutes) <= UNIVERSITY_DAY_END_MINUTE;
};

export const spendMinutes = (
  clock: DayClockState,
  durationMinutes: number,
): DayClockState | undefined => {
  if (!canSpendMinutes(clock, durationMinutes)) return undefined;
  return {
    dayKey: clock.dayKey,
    minute: clampGameMinute(clock.minute + durationMinutes),
  };
};

export const formatGameMinute = (minute: number) => {
  const normalized = clampGameMinute(minute);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const minutesRemainingInDay = (clock: DayClockState) =>
  Math.max(0, UNIVERSITY_DAY_END_MINUTE - clock.minute);
