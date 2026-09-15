import { campusLocations } from '../campus/config';
import {
  campusActivities,
  campusActivityRules,
  getCampusActivities,
  getCampusActivity,
} from './activities';

describe('campus activities', () => {
  test('offers ordinary activities in every playable generic campus location', () => {
    for (const locationId of Object.keys(campusLocations)) {
      const activities = getCampusActivities(locationId);
      expect(activities.length).toBeGreaterThanOrEqual(2);
      expect(activities.every((activity) => activity.locationId === locationId)).toBe(true);
    }
  });

  test('keeps activity IDs unique and ordinary-life only', () => {
    const ids = campusActivities.map((activity) => activity.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(campusActivities.every((activity) => activity.tags.includes('pure-life'))).toBe(true);
    expect(campusActivities.every((activity) => activity.estimatedMinutes > 0)).toBe(true);
  });

  test('looks up stable activity definitions by id', () => {
    expect(getCampusActivity('cafeteria_have_meal')?.locationId).toBe('cafeteria');
    expect(getCampusActivity('library_quiet_study')?.locationId).toBe('library');
    expect(getCampusActivity('missing_activity')).toBeUndefined();
  });

  test('ordinary activities cannot substitute for core scenario completion', () => {
    expect(campusActivityRules.countsAsCoreScenario).toBe(false);
    expect(campusActivityRules.countsAsOrdinaryLifeExperience).toBe(true);
    expect(campusActivityRules.repeatSameActivityPerDay).toBe(false);
    expect(campusActivityRules.maxDistinctActivitiesPerDay).toBe(3);
  });
});
