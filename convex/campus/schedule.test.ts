import {
  getUniversityScheduleMoment,
  parseClockTime,
  universityScheduleEntries,
} from './schedule';

describe('university schedule', () => {
  test('parses valid HH:MM values and rejects invalid clock text', () => {
    expect(parseClockTime('08:30')).toBe(8 * 60 + 30);
    expect(parseClockTime('23:00')).toBe(23 * 60);
    expect(parseClockTime('8:30')).toBeUndefined();
    expect(parseClockTime('24:00')).toBeUndefined();
    expect(parseClockTime('12:60')).toBeUndefined();
  });

  test('keeps the authored university day in chronological order', () => {
    expect(universityScheduleEntries.map((entry) => entry.time)).toEqual([
      '08:00',
      '08:30',
      '09:00',
      '12:00',
      '14:00',
      '17:00',
      '19:00',
      '22:00',
    ]);
  });

  test('returns the current rhythm and the next planned beat', () => {
    const morning = getUniversityScheduleMoment(9 * 60 + 30);
    expect(morning.current?.activity).toBe('课程');
    expect(morning.current?.location).toBe('teaching_building');
    expect(morning.next?.time).toBe('12:00');
    expect(morning.next?.activity).toBe('午餐');

    const evening = getUniversityScheduleMoment(22 * 60 + 30);
    expect(evening.current?.activity).toBe('住宿区生活');
    expect(evening.next).toBeUndefined();
  });
});
