import { p003LifeChapters } from './p003Development';
import type {
  AcademicYear,
  CareerStage,
  LifeProfileSnapshot,
  LifeSeasonId,
  LifeStageId,
} from './types';

export type P003ChapterTransitionDefaults = {
  minimumAge: number;
  season: LifeSeasonId;
  lifeStage: LifeStageId;
  academicYear: AcademicYear;
  careerStage: CareerStage;
};

export const p003ChapterTransitionDefaults: Record<string, P003ChapterTransitionDefaults> = {
  birth_and_family: {
    minimumAge: 0,
    season: 'origin',
    lifeStage: 'infancy_foundations',
    academicYear: 'none',
    careerStage: 'not_applicable',
  },
  early_childhood: {
    minimumAge: 2,
    season: 'early_childhood',
    lifeStage: 'early_childhood_autonomy',
    academicYear: 'none',
    careerStage: 'not_applicable',
  },
  primary_school_years: {
    minimumAge: 6,
    season: 'school_age',
    lifeStage: 'middle_childhood_competence',
    academicYear: 'none',
    careerStage: 'not_applicable',
  },
  adolescence_years: {
    minimumAge: 12,
    season: 'adolescence',
    lifeStage: 'adolescence_identity',
    academicYear: 'none',
    careerStage: 'not_applicable',
  },
  launch_into_adulthood: {
    minimumAge: 18,
    season: 'emerging_adulthood',
    lifeStage: 'emerging_adulthood',
    academicYear: 'none',
    careerStage: 'not_applicable',
  },
  early_adult_building: {
    minimumAge: 25,
    season: 'early_adulthood',
    lifeStage: 'early_adulthood_intimacy',
    academicYear: 'none',
    careerStage: 'early_career',
  },
  middle_adult_responsibility: {
    minimumAge: 35,
    season: 'middle_adulthood',
    lifeStage: 'adulthood_generativity',
    academicYear: 'none',
    careerStage: 'established_career',
  },
  later_adult_transition: {
    minimumAge: 55,
    season: 'later_adulthood',
    lifeStage: 'later_adulthood_transition',
    academicYear: 'none',
    careerStage: 'late_career',
  },
  p003_retirement_reconstruction: {
    minimumAge: 65,
    season: 'retirement',
    lifeStage: 'later_adulthood_transition',
    academicYear: 'none',
    careerStage: 'retired',
  },
  p003_life_review: {
    minimumAge: 75,
    season: 'life_review',
    lifeStage: 'late_life_integrity',
    academicYear: 'none',
    careerStage: 'retired',
  },
};

const roundedAge = (value: number) => Math.round(value * 10) / 10;

const estimateAgeWithinChapter = (
  chapter: (typeof p003LifeChapters)[number],
  chapterUnit: number,
) => {
  if (chapter.expectedPlayableUnits <= 1) return chapter.ageRange[1];
  const progress = Math.max(
    0,
    Math.min(1, (chapterUnit - 1) / (chapter.expectedPlayableUnits - 1)),
  );
  return roundedAge(
    chapter.ageRange[0] + progress * (chapter.ageRange[1] - chapter.ageRange[0]),
  );
};

export const advanceP003ChapterClock = (
  snapshot: LifeProfileSnapshot,
): { next: LifeProfileSnapshot; chapterEnded: boolean; previousChapterId: string } => {
  const currentIndex = p003LifeChapters.findIndex((chapter) => chapter.id === snapshot.chapterId);
  if (currentIndex < 0) {
    return {
      next: {
        ...snapshot,
        chapterUnit: snapshot.chapterUnit + 1,
        totalGameDays: snapshot.totalGameDays + 1,
      },
      chapterEnded: false,
      previousChapterId: snapshot.chapterId,
    };
  }

  const chapter = p003LifeChapters[currentIndex];
  if (snapshot.chapterUnit < chapter.expectedPlayableUnits) {
    const chapterUnit = snapshot.chapterUnit + 1;
    return {
      next: {
        ...snapshot,
        age: Math.max(snapshot.age, estimateAgeWithinChapter(chapter, chapterUnit)),
        chapterUnit,
        totalGameDays: snapshot.totalGameDays + 1,
      },
      chapterEnded: false,
      previousChapterId: snapshot.chapterId,
    };
  }

  const nextChapter = p003LifeChapters[currentIndex + 1];
  if (!nextChapter) {
    return {
      next: {
        ...snapshot,
        chapterUnit: snapshot.chapterUnit + 1,
        totalGameDays: snapshot.totalGameDays + 1,
      },
      chapterEnded: false,
      previousChapterId: snapshot.chapterId,
    };
  }

  const defaults = p003ChapterTransitionDefaults[nextChapter.id];
  return {
    next: {
      ...snapshot,
      age: Math.max(snapshot.age, defaults?.minimumAge ?? nextChapter.ageRange[0]),
      season: defaults?.season ?? nextChapter.season,
      lifeStage: defaults?.lifeStage ?? snapshot.lifeStage,
      chapterId: nextChapter.id,
      chapterUnit: 1,
      totalGameDays: snapshot.totalGameDays + 1,
      academicYear: defaults?.academicYear ?? snapshot.academicYear,
      careerStage: defaults?.careerStage ?? snapshot.careerStage,
    },
    chapterEnded: true,
    previousChapterId: snapshot.chapterId,
  };
};
