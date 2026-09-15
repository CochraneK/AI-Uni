import { generateLifeOrigin } from './origin';

describe('p003 life origin', () => {
  test('is deterministic for the same seed', () => {
    expect(generateLifeOrigin('same-seed', 2000)).toEqual(
      generateLifeOrigin('same-seed', 2000),
    );
  });

  test('keeps all generated context dimensions bounded', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const origin = generateLifeOrigin(seed, 2000);
      for (const value of [
        origin.householdMaterialSecurity,
        origin.caregivingStability,
        origin.learningAccess,
        origin.neighborhoodOpportunity,
        origin.familySupportDensity,
      ]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  test('does not derive care quality directly from household structure', () => {
    const samples = Array.from({ length: 200 }, (_, index) =>
      generateLifeOrigin(`origin-${index}`, 2000),
    );
    const singleCaregiver = samples.filter(
      (sample) => sample.householdStructure === 'single_caregiver',
    );
    expect(singleCaregiver.some((sample) => sample.caregivingStability > 0.7)).toBe(true);
  });
});
