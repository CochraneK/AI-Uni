export type InstitutionModel =
  | 'research_university'
  | 'teaching_university'
  | 'liberal_arts_college'
  | 'applied_or_vocational'
  | 'community_college'
  | 'other';

export type CampusForm = 'residential' | 'commuter' | 'hybrid' | 'distributed';
export type Urbanicity = 'urban' | 'suburban' | 'town' | 'rural' | 'mixed';
export type AcademicCalendar = 'semester' | 'quarter' | 'trimester' | 'custom';
export type UniversityTemplateStatus = 'core' | 'planned' | 'available';

export type UniversityProfile = {
  id: string;
  name: string;
  description: string;
  status: UniversityTemplateStatus;
  institutionModel: InstitutionModel;
  campusForm: CampusForm;
  urbanicity: Urbanicity;
  academicCalendar: AcademicCalendar;
  typicalUndergraduateYears?: number;
  housingAvailability: 'high' | 'medium' | 'low' | 'varies';
  commuterShare: 'high' | 'medium' | 'low' | 'varies';
  campusOpenness: 'open' | 'semi_open' | 'controlled' | 'varies';
  culturalContextTags: string[];
  enabledLocationIds: string[];
  locationDisplayNames?: Partial<Record<string, string>>;
  themePackIds?: string[];
  mapId?: string;
  notes?: string[];
};

export const genericUniversityProfile: UniversityProfile = {
  id: 'generic_university',
  name: '通用大学',
  description:
    '不绑定具体学校、城市或国家的大学生活基线。具体建筑、制度、住宿方式、学制和校园文化通过 profile/theme pack 覆盖。',
  status: 'core',
  institutionModel: 'research_university',
  campusForm: 'hybrid',
  urbanicity: 'mixed',
  academicCalendar: 'semester',
  typicalUndergraduateYears: 4,
  housingAvailability: 'varies',
  commuterShare: 'varies',
  campusOpenness: 'varies',
  culturalContextTags: ['generic', 'configurable'],
  enabledLocationIds: [
    'campus_gate',
    'teaching_building',
    'library',
    'student_center',
    'cafeteria',
    'campus_green',
    'sports_field',
    'dormitory',
  ],
  mapId: 'generic_campus_v1',
  themePackIds: ['campus-life', 'social-friction'],
};

export const universityProfileDesignRules = [
  'Core gameplay must not require a named university to make sense.',
  'Institution-specific buildings, traditions, grading systems and cultural assumptions belong in profiles or theme packs.',
  'Specific university templates are supported, but none should become a dependency of the generic core.',
  'Residential and commuter students should both be supported; dormitory scenes cannot be mandatory for every profile.',
  'Program length and academic calendar must be configurable instead of assuming every degree is four years with two semesters.',
  'Location names shown to players may be themed while scenario logic continues to use stable generic location IDs.',
  'Real-university templates should distinguish sourced factual features from fictionalized gameplay additions.',
] as const;
