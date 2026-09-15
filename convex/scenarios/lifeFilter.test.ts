import { getScenario } from './registry';
import { scenarioMatchesLifeContext } from './lifeFilter';
import { defaultLifeProfile } from '../life/model';

const scenario = (id: string) => {
  const value = getScenario(id);
  if (!value) throw new Error(`Missing scenario ${id}`);
  return value;
};

describe('scenarioMatchesLifeContext', () => {
  test('keeps a first-week event on its configured day', () => {
    const scheduleChange = scenario('schedule_change_01');

    expect(
      scenarioMatchesLifeContext(scheduleChange, {
        profile: { ...defaultLifeProfile, chapterUnit: 2 },
      }),
    ).toBe(true);
    expect(
      scenarioMatchesLifeContext(scheduleChange, {
        profile: { ...defaultLifeProfile, chapterUnit: 3 },
      }),
    ).toBe(false);
  });

  test('firstWeekDays does not permanently lock reusable content after the first chapter', () => {
    const scheduleChange = scenario('schedule_change_01');

    expect(
      scenarioMatchesLifeContext(scheduleChange, {
        profile: {
          ...defaultLifeProfile,
          chapterId: 'freshman_year',
          chapterUnit: 12,
        },
      }),
    ).toBe(true);
  });
});
