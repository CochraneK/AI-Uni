import { getScenario } from './registry';
import { scenarioAutoCompletionThreshold } from './progress';

const scenario = (id: string) => {
  const value = getScenario(id);
  if (!value) throw new Error(`Missing scenario ${id}`);
  return value;
};

describe('scenarioAutoCompletionThreshold', () => {
  test('completes pure ordinary-life scenes after one meaningful player reply', () => {
    expect(scenarioAutoCompletionThreshold(scenario('breakfast_routine_01'))).toBe(1);
  });

  test('uses two replies for ordinary task scenes', () => {
    expect(scenarioAutoCompletionThreshold(scenario('schedule_change_01'))).toBe(2);
  });

  test('uses three replies for mild-stress scenes', () => {
    expect(scenarioAutoCompletionThreshold(scenario('presentation_reminder_01'))).toBe(3);
  });

  test('never auto-completes sensitive scenes', () => {
    expect(scenarioAutoCompletionThreshold(scenario('campus_drill_01'))).toBeUndefined();
  });
});
