import { evaluateFirstWeekReadiness } from './firstWeekProgress';

describe('first-week progress evaluation', () => {
  test('is read-only when no progress row exists yet', async () => {
    const profile = {
      chapterId: 'university_first_week',
      chapterUnit: 3,
    };
    let getCalls = 0;
    const db = {
      query: () => ({
        withIndex: () => ({
          first: async () => null,
        }),
      }),
      get: async () => {
        getCalls += 1;
        return profile;
      },
      // Intentionally no insert/patch methods: query handlers do not expose them.
    };

    const readiness = await evaluateFirstWeekReadiness({ db } as any, 'profile:1' as any);

    expect(readiness.completedPlayableDays).toBe(2);
    expect(readiness.completedCoreEvents).toBe(0);
    expect(readiness.distinctNpcInteractions).toBe(0);
    expect(readiness.ordinaryLifeCompleted).toBe(false);
    expect(readiness.ready).toBe(false);
    expect(getCalls).toBe(1);
  });
});
