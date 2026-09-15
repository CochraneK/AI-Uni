import { completeScenarioRun } from './completion';

const makeContext = (startMinute = 8 * 60) => {
  const dayKey = 'freshman_year:1:7';
  const documents = new Map<string, any>([
    [
      'runtime-1',
      {
        _id: 'runtime-1',
        profileId: 'profile-1',
        activeLocationId: 'cafeteria',
        activeScenarioId: 'breakfast_routine_01',
        activeRunId: 'run-1',
        completedScenarioIds: [],
      },
    ],
    [
      'run-1',
      {
        _id: 'run-1',
        scenarioId: 'breakfast_routine_01',
        startedAtGameMinute: startMinute,
      },
    ],
    [
      'profile-1',
      {
        _id: 'profile-1',
        chapterId: 'freshman_year',
        chapterUnit: 1,
        totalGameDays: 7,
        age: 18,
        state: {
          dayClock: { dayKey, minute: startMinute },
        },
      },
    ],
  ]);

  const db = {
    get: async (id: string) => documents.get(id) ?? null,
    patch: async (id: string, patch: any) => {
      const current = documents.get(id);
      if (!current) throw new Error(`Missing document ${id}`);
      documents.set(id, { ...current, ...patch });
    },
  };

  return { ctx: { db }, documents };
};

describe('completeScenarioRun', () => {
  test('advances the day clock exactly once even if completion is requested twice', async () => {
    const { ctx, documents } = makeContext();

    const first = await completeScenarioRun(ctx, 'runtime-1', {
      outcome: 'completed_by_player',
    });
    expect(first.completed).toBe(true);
    expect(first.completed && first.endedAtGameMinute).toBe(8 * 60 + 30);
    expect(documents.get('profile-1').state.dayClock.minute).toBe(8 * 60 + 30);

    const second = await completeScenarioRun(ctx, 'runtime-1', {
      outcome: 'auto_completed_dialogue',
    });
    expect(second).toEqual({ completed: false, reason: 'no_active_scenario' });
    expect(documents.get('profile-1').state.dayClock.minute).toBe(8 * 60 + 30);
  });

  test('does not complete or mutate the clock when a legacy run no longer fits today', async () => {
    const { ctx, documents } = makeContext(22 * 60 + 45);

    const result = await completeScenarioRun(ctx, 'runtime-1', {
      outcome: 'completed_by_player',
    });

    expect(result.completed).toBe(false);
    expect(result.reason).toBe('not_enough_time');
    expect(documents.get('profile-1').state.dayClock.minute).toBe(22 * 60 + 45);
    expect(documents.get('runtime-1').activeRunId).toBe('run-1');
    expect(documents.get('run-1').endedAt).toBeUndefined();
  });
});
