import { campusLocations } from './config';
import type { UniversityProfile } from './profiles';

export type UniversityProfileValidationIssue = {
  level: 'error' | 'warning';
  code: string;
  profileId?: string;
  message: string;
};

export const validateUniversityProfiles = (
  profiles: UniversityProfile[],
): UniversityProfileValidationIssue[] => {
  const issues: UniversityProfileValidationIssue[] = [];
  const ids = new Set<string>();
  const knownLocations = new Set(Object.keys(campusLocations));

  for (const profile of profiles) {
    if (ids.has(profile.id)) {
      issues.push({
        level: 'error',
        code: 'duplicate_profile_id',
        profileId: profile.id,
        message: `Duplicate university profile id: ${profile.id}`,
      });
    }
    ids.add(profile.id);

    for (const locationId of profile.enabledLocationIds) {
      if (!knownLocations.has(locationId)) {
        issues.push({
          level: 'error',
          code: 'unknown_enabled_location',
          profileId: profile.id,
          message: `${profile.id} enables unknown generic location: ${locationId}`,
        });
      }
    }

    for (const locationId of Object.keys(profile.locationDisplayNames ?? {})) {
      if (!knownLocations.has(locationId)) {
        issues.push({
          level: 'error',
          code: 'unknown_location_override',
          profileId: profile.id,
          message: `${profile.id} overrides unknown generic location: ${locationId}`,
        });
      }
    }

    if (profile.status !== 'core' && !profile.mapId) {
      issues.push({
        level: 'warning',
        code: 'template_without_map',
        profileId: profile.id,
        message: `${profile.id} has no mapId; generic map fallback will be required.`,
      });
    }
  }

  const coreProfiles = profiles.filter((profile) => profile.status === 'core');
  if (coreProfiles.length !== 1 || coreProfiles[0]?.id !== 'generic_university') {
    issues.push({
      level: 'error',
      code: 'invalid_core_profile',
      message: 'Exactly one core profile must exist and it must be generic_university.',
    });
  }

  return issues;
};

export const assertValidUniversityProfiles = (profiles: UniversityProfile[]) => {
  const errors = validateUniversityProfiles(profiles).filter((issue) => issue.level === 'error');
  if (errors.length > 0) {
    throw new Error(
      `Invalid university profiles:\n${errors.map((issue) => `- ${issue.message}`).join('\n')}`,
    );
  }
};
