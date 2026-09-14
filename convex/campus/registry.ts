import { genericUniversityProfile, type UniversityProfile } from './profiles';
import { bjtuUniversityTemplate } from './templates/bjtu';

export const universityProfiles: UniversityProfile[] = [
  genericUniversityProfile,
  bjtuUniversityTemplate,
];

export const defaultUniversityProfileId = genericUniversityProfile.id;

export const getUniversityProfile = (id: string) =>
  universityProfiles.find((profile) => profile.id === id);

export const getDefaultUniversityProfile = () => genericUniversityProfile;

export const listAvailableUniversityTemplates = () =>
  universityProfiles.filter((profile) => profile.status === 'available');

export const listPlannedUniversityTemplates = () =>
  universityProfiles.filter((profile) => profile.status === 'planned');

export const resolveCampusDisplayName = (profile: UniversityProfile, locationId: string, fallback: string) =>
  profile.locationDisplayNames?.[locationId] ?? fallback;
