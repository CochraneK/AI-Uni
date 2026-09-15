import { materializedFirstWeekCommitments } from '../campus/commitments';
import {
  EARLY_ARRIVAL_MINUTES,
  commitmentTemporalState,
} from './commitments';

const baseCommitment = {
  status: 'scheduled',
  startMinute: 9 * 60,
  endMinute: 10 * 60,
  graceMinutes: 10,
};

describe('scheduled commitments', () => {
  test('defines a small first-week calendar without filling every day', () => {
    expect(materializedFirstWeekCommitments).toHaveLength(6);
    expect(materializedFirstWeekCommitments.map((item) => item.chapterUnit)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(materializedFirstWeekCommitments.every((item) => item.startMinute < item.endMinute)).toBe(
      true,
    );
  });

  test('opens arrival shortly before the scheduled start', () => {
    expect(
      commitmentTemporalState(
        baseCommitment,
        baseCommitment.startMinute - EARLY_ARRIVAL_MINUTES - 1,
      ),
    ).toBe('upcoming');
    expect(
      commitmentTemporalState(
        baseCommitment,
        baseCommitment.startMinute - EARLY_ARRIVAL_MINUTES,
      ),
    ).toBe('arrival_window');
  });

  test('distinguishes on-time/grace arrival from late arrival', () => {
    expect(
      commitmentTemporalState(
        baseCommitment,
        baseCommitment.startMinute + baseCommitment.graceMinutes,
      ),
    ).toBe('arrival_window');
    expect(
      commitmentTemporalState(
        baseCommitment,
        baseCommitment.startMinute + baseCommitment.graceMinutes + 1,
      ),
    ).toBe('late_window');
  });

  test('becomes expired at the scheduled end', () => {
    expect(commitmentTemporalState(baseCommitment, baseCommitment.endMinute - 1)).toBe(
      'late_window',
    );
    expect(commitmentTemporalState(baseCommitment, baseCommitment.endMinute)).toBe('expired');
  });

  test('resolved attendance state is never reinterpreted by the clock', () => {
    expect(
      commitmentTemporalState(
        { ...baseCommitment, status: 'attended_late' },
        baseCommitment.endMinute + 100,
      ),
    ).toBe('resolved');
  });

  test('keeps optional plans explicit rather than treating all nonattendance as failure', () => {
    const optional = materializedFirstWeekCommitments.filter(
      (item) => !item.attendanceRequired,
    );
    expect(optional.map((item) => item.kind)).toEqual(['club_meeting', 'social_plan']);
  });
});
