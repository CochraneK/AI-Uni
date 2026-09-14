import { campusTravelRules, estimateCampusTravelMinutes } from './travel';

describe('campus travel time', () => {
  test('does not charge time inside the same semantic location', () => {
    expect(
      estimateCampusTravelMinutes(
        'generic_campus_v1',
        'library',
        'library',
      ),
    ).toBe(0);
  });

  test('uses coarse five-minute steps for nearby campus locations', () => {
    expect(
      estimateCampusTravelMinutes(
        'generic_campus_v1',
        'teaching_building',
        'library',
      ),
    ).toBe(5);
    expect(
      estimateCampusTravelMinutes(
        'generic_campus_v1',
        'cafeteria',
        'campus_green',
      ),
    ).toBe(5);
  });

  test('charges more for long cross-campus walks without exceeding the cap', () => {
    const longWalk = estimateCampusTravelMinutes(
      'generic_campus_v1',
      'campus_gate',
      'teaching_building',
    );
    expect(longWalk).toBe(15);
    expect(longWalk).toBeLessThanOrEqual(campusTravelRules.maximumMinutes);
  });

  test('is symmetric between the same pair of semantic zones', () => {
    expect(
      estimateCampusTravelMinutes(
        'generic_campus_v1',
        'dormitory',
        'student_center',
      ),
    ).toBe(
      estimateCampusTravelMinutes(
        'generic_campus_v1',
        'student_center',
        'dormitory',
      ),
    );
  });

  test('returns undefined when a layout has no matching semantic destination', () => {
    expect(
      estimateCampusTravelMinutes(
        'generic_campus_v1',
        'library',
        'restaurant',
      ),
    ).toBeUndefined();
  });
});
