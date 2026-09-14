import type { ConstructId } from './constructs';

export type MeasureId =
  | 'big5_calibration'
  | 'cape_p15'
  | 'pcl5'
  | 'custom';

export type AssessmentMeasureDefinition = {
  id: MeasureId | string;
  name: string;
  purpose: 'calibration' | 'criterion' | 'research_only';
  constructs: ConstructId[];
  itemContentBundled: boolean;
  enabledByDefault: boolean;
  scoringPolicy: string;
  implementationNote: string;
};

export const assessmentMeasureRegistry: Record<string, AssessmentMeasureDefinition> = {
  big5_calibration: {
    id: 'big5_calibration',
    name: 'Big Five calibration measure',
    purpose: 'calibration',
    constructs: [
      'big5.openness',
      'big5.conscientiousness',
      'big5.extraversion',
      'big5.agreeableness',
      'big5.neuroticism',
    ],
    itemContentBundled: false,
    enabledByDefault: true,
    scoringPolicy: 'Only score using the selected instrument’s documented scoring rules.',
    implementationNote:
      'The registry intentionally does not hard-code a specific Big Five questionnaire. Select an instrument appropriate for the study population, language, licensing and validation plan.',
  },
  cape_p15: {
    id: 'cape_p15',
    name: 'CAPE-P15',
    purpose: 'criterion',
    constructs: [
      'cape.persecutory_ideation',
      'cape.bizarre_experiences',
      'cape.perceptual_abnormalities',
    ],
    itemContentBundled: false,
    enabledByDefault: false,
    scoringPolicy:
      'Use only the authorized/validated study version. Game behavior must not be converted into CAPE-P15 item responses.',
    implementationNote:
      'Keep questionnaire delivery and game-derived behavioral features separate so measurement equivalence can be tested.',
  },
  pcl5: {
    id: 'pcl5',
    name: 'PCL-5',
    purpose: 'criterion',
    constructs: [
      'pcl5_associated.intrusion',
      'pcl5_associated.avoidance',
      'pcl5_associated.negative_mood_cognition',
      'pcl5_associated.arousal_reactivity',
    ],
    itemContentBundled: false,
    enabledByDefault: false,
    scoringPolicy:
      'Use the formal PCL-5 independently. Do not infer item responses, total scores or PTSD diagnosis from game telemetry.',
    implementationNote:
      'Any trauma-related study flow needs explicit eligibility, consent, opt-out, risk handling and referral procedures.',
  },
};

export const getAssessmentMeasure = (id: string) => assessmentMeasureRegistry[id];

export const registerableMeasureTemplate: AssessmentMeasureDefinition = {
  id: 'custom',
  name: 'New measure',
  purpose: 'calibration',
  constructs: [],
  itemContentBundled: false,
  enabledByDefault: false,
  scoringPolicy: 'Define scoring and interpretation before collecting data.',
  implementationNote:
    'Add a registry entry, map it to constructs, document licensing/language/validation, then add questionnaire delivery separately from game scenarios.',
};
