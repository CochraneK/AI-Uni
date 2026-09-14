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
});
