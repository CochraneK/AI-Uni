import { lifeChapters } from './development';
import type { AcademicYear, CareerStage, LifeProfileSnapshot, LifeSeasonId, LifeStageId } from './types';

export type ChapterTransitionDefaults = {
  minimumAge: number;
  season: LifeSeasonId;
  lifeStage: LifeStageId;
  academicYear: AcademicYear;
  careerStage: CareerStage;
};

export const chapterTransitionDefaults: Record<string, ChapterTransitionDefaults> = {
  university_first_week: {
    minimumAge: 18,
    season: 'university',
    lifeStage: 'late_adolescence_identity',
    academicYear: 'year_1',
    careerStage: 'student',
  },
  freshman_year: {
    minimumAge: 18,
    season: 'university',
    lifeStage: 'late_adolescence_identity',
    academicYear: 'year_1',
    careerStage: 'student',
  },
  sophomore_year: {
    minimumAge: 19,
    season: 'university',
    lifeStage: 'emerging_adulthood',
    academicYear: 'year_2',
    careerStage: 'student',
  },
  junior_year: {
    minimumAge: 20,
    season: 'university',
    lifeStage: 'emerging_adulthood',
    academicYear: 'year_3',
    careerStage: 'student',
  },
  senior_year_graduation: {
    minimumAge: 21,
    season: 'university',
    lifeStage: 'emerging_adulthood',
    academicYear: 'year_4',
    careerStage: 'job_search',
  },
  early_career_entry: {
    minimumAge: 22,
    season: 'early_career',
    lifeStage: 'early_adulthood_intimacy',
    academicYear: 'none',
    careerStage: 'early_career',
  },
  partnership_and_family_choices: {
    minimumAge: 25,
    season: 'partnership_family',
    lifeStage: 'early_adulthood_intimacy',
    academicYear: 'none',
    careerStage: 'established_career',
  },
  midlife_responsibility: {
    minimumAge: 35,
    season: 'midlife',
    lifeStage: 'adulthood_generativity',
    academicYear: 'none',
    careerStage: 'established_career',
  },
  later_career_transition: {
    minimumAge: 50,
    season: 'later_career',
    lifeStage: 'later_adulthood_transition',
    academicYear: 'none',
    careerStage: 'late_career',
  },
  retirement_reconstruction: {
    minimumAge: 60,
    season: 'retirement',
    lifeStage: 'later_adulthood_transition',
    academicYear: 'none',
    careerStage: 'retired',
  },
  life_review: {
    minimumAge: 70,
    season: 'life_review',
    lifeStage: 'late_life_integrity',
    academicYear: 'none',
    careerStage: 'retired',
  },
};

export const advanceChapterClock = (
  snapshot: LifeProfileSnapshot,
): { next: LifeProfileSnapshot; chapterEnded: boolean; previousChapterId: string } => {
  const currentIndex = lifeChapters.findIndex((chapter) => chapter.id === snapshot.chapterId);
  if (currentIndex < 0) {
    return {
      next: { ...snapshot, chapterUnit: snapshot.chapterUnit + 1, totalGameDays: snapshot.totalGameDays + 1 },
      chapterEnded: false,
      previousChapterId: snapshot.chapterId,
    };
  }

  const chapter = lifeChapters[currentIndex];
  if (snapshot.chapterUnit < chapter.expectedPlayableUnits) {
    return {
      next: { ...snapshot, chapterUnit: snapshot.chapterUnit + 1, totalGameDays: snapshot.totalGameDays + 1 },
      chapterEnded: false,
      previousChapterId: snapshot.chapterId,
    };
  }

  const nextChapter = lifeChapters[currentIndex + 1];
  if (!nextChapter) {
    return {
      next: { ...snapshot, chapterUnit: snapshot.chapterUnit + 1, totalGameDays: snapshot.totalGameDays + 1 },
      chapterEnded: false,
      previousChapterId: snapshot.chapterId,
    };
  }

  const defaults = chapterTransitionDefaults[nextChapter.id];
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
