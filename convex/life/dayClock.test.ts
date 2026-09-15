import {
  UNIVERSITY_DAY_END_MINUTE,
  UNIVERSITY_DAY_START_MINUTE,
  canSpendMinutes,
  formatGameMinute,
  getDayClock,
  makeDayClockKey,
  minutesRemainingInDay,
  spendMinutes,
} from './dayClock';

describe('university day clock', () => {
  const dayKey = 'university_first_week:1:1';

  test('starts a new game day at 08:00', () => {
    expect(getDayClock({}, dayKey)).toEqual({
      dayKey,
      minute: UNIVERSITY_DAY_START_MINUTE,
    });
    expect(formatGameMinute(UNIVERSITY_DAY_START_MINUTE)).toBe('08:00');
  });

  test('reuses only the clock from the same game day', () => {
    expect(getDayClock({ dayClock: { dayKey, minute: 615 } }, dayKey).minute).toBe(615);
    expect(
      getDayClock({ dayClock: { dayKey: 'old-day', minute: 900 } }, dayKey).minute,
    ).toBe(UNIVERSITY_DAY_START_MINUTE);
  });

  test('advances by activity duration without crossing the 23:00 boundary', () => {
    const clock = { dayKey, minute: 22 * 60 + 30 };
    expect(canSpendMinutes(clock, 30)).toBe(true);
    expect(spendMinutes(clock, 30)?.minute).toBe(UNIVERSITY_DAY_END_MINUTE);
    expect(canSpendMinutes(clock, 31)).toBe(false);
    expect(spendMinutes(clock, 31)).toBeUndefined();
  });

  test('rejects invalid durations and exposes remaining time', () => {
    const clock = { dayKey, minute: 20 * 60 };
    expect(canSpendMinutes(clock, 0)).toBe(false);
    expect(canSpendMinutes(clock, -10)).toBe(false);
    expect(minutesRemainingInDay(clock)).toBe(180);
  });

  test('creates stable day keys from chapter progress', () => {
    expect(
      makeDayClockKey({ chapterId: 'university_first_week', chapterUnit: 3, totalGameDays: 3 }),
    ).toBe('university_first_week:3:3');
  });
});
