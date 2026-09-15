import { generateLifeOrigin } from './origin';
import { createP003LifeProfileSnapshot } from './p003Model';
import { advanceP003ChapterClock } from './p003Transitions';
import type { LifeProfileSnapshot } from './types';

describe('p003 lifespan chapter clock', () => {
  test('starts at birth and transitions into early childhood', () => {
    let snapshot = createP003LifeProfileSnapshot(generateLifeOrigin('clock', 2000));
    expect(snapshot.chapterId).toBe('birth_and_family');
    expect(snapshot.age).toBe(0);

    for (let step = 0; step < 5; step += 1) {
      snapshot = advanceP003ChapterClock(snapshot).next;
    }

    expect(snapshot.chapterId).toBe('early_childhood');
    expect(snapshot.age).toBeGreaterThanOrEqual(2);
    expect(snapshot.lifeStage).toBe('early_childhood_autonomy');
  });

  test('does not force university at the transition to adulthood', () => {
    let snapshot: LifeProfileSnapshot = {
      ...createP003LifeProfileSnapshot(generateLifeOrigin('adult', 2000)),
      age: 17,
      season: 'adolescence' as const,
      lifeStage: 'adolescence_identity' as const,
      chapterId: 'adolescence_years',
      chapterUnit: 8,
      academicYear: 'none' as const,
      careerStage: 'not_applicable' as const,
    };

    snapshot = advanceP003ChapterClock(snapshot).next;

    expect(snapshot.chapterId).toBe('launch_into_adulthood');
    expect(snapshot.season).toBe('emerging_adulthood');
    expect(snapshot.academicYear).toBe('none');
    expect(snapshot.careerStage).toBe('not_applicable');
  });
});
