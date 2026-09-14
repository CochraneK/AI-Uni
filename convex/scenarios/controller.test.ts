import { defaultLifeProfile } from '../life/model';
import { getScenario } from './registry';
import {
  buildScenarioCandidates,
  scenarioCanRun,
  type ScenarioSelectionContext,
} from './controller';

const scenario = (id: string) => {
  const value = getScenario(id);
  if (!value) throw new Error(`Missing scenario ${id}`);
  return value;
};

const context = (
  overrides: Partial<ScenarioSelectionContext> = {},
): ScenarioSelectionContext => ({
  locationId: 'cafeteria',
  life: {
    profile: {
      ...defaultLifeProfile,
      chapterId: 'freshman_year',
      chapterUnit: 1,
    },
  },
  enabledPackIds: ['campus-life', 'social-friction'],
  recentScenarioIds: [],
  completedScenarioIds: [],
  sensitiveResearchConsent: false,
  remainingMinutes: 15 * 60,
  seed: 'test-seed',
  selectionIndex: 0,
  ...overrides,
});

describe('scenario controller', () => {
  test('blocks sensitive research until separate consent is enabled', () => {
    const drill = scenario('campus_drill_01');
    const withoutConsent = context({
      locationId: 'dormitory',
      enabledPackIds: ['sensitive-research'],
      sensitiveResearchConsent: false,
    });

    expect(scenarioCanRun(drill, withoutConsent)).toBe(false);
    expect(
      scenarioCanRun(drill, {
        ...withoutConsent,
        sensitiveResearchConsent: true,
      }),
    ).toBe(true);
  });

  test('gives ordinary life more weight than research scenes at the same location', () => {
    const candidates = buildScenarioCandidates(context());
    const ordinary = candidates.find(
      (candidate) => candidate.scenario.id === 'breakfast_routine_01',
    );
    const research = candidates.filter(
      (candidate) => candidate.scenario.researchUse !== 'none',
    );

    expect(ordinary).toBeDefined();
    expect(research.length).toBeGreaterThan(0);
    expect(ordinary?.reasons).toContain('ordinary-life-priority');
    expect(ordinary!.weight).toBeGreaterThan(
      Math.max(...research.map((candidate) => candidate.weight)),
    );
  });

  test('excludes scenes that cannot finish before the day cutoff', () => {
    const candidates = buildScenarioCandidates(context({ remainingMinutes: 20 }));

    expect(candidates.every((candidate) => candidate.scenario.estimatedMinutes <= 20)).toBe(true);
    expect(
      candidates.some((candidate) => candidate.scenario.id === 'breakfast_routine_01'),
    ).toBe(false);
  });

  test('returns no runnable scene when the game day has no time left', () => {
    expect(buildScenarioCandidates(context({ remainingMinutes: 0 }))).toEqual([]);
  });

  test('allows breakfast while its full duration fits the authored breakfast window', () => {
    const breakfast = scenario('breakfast_routine_01');
    expect(
      scenarioCanRun(
        breakfast,
        context({ gameMinute: 9 * 60, remainingMinutes: 14 * 60 }),
      ),
    ).toBe(true);
  });

  test('blocks breakfast when it would finish after the authored breakfast window', () => {
    const breakfast = scenario('breakfast_routine_01');
    expect(
      scenarioCanRun(
        breakfast,
        context({ gameMinute: 9 * 60 + 45, remainingMinutes: 13 * 60 + 15 }),
      ),
    ).toBe(false);
  });

  test('blocks breakfast outside its authored time of day', () => {
    const breakfast = scenario('breakfast_routine_01');
    expect(
      scenarioCanRun(
        breakfast,
        context({ gameMinute: 12 * 60, remainingMinutes: 11 * 60 }),
      ),
    ).toBe(false);
  });
});
