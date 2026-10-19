import Dexie, { type Table } from 'dexie';
import type {
  TaskProgress,
  QuestionAttempt,
  StudySession,
  VocabularyProgress,
  ReviewItem,
  UserPreferences,
  SavedWord,
} from '../domain/types';

export class EnglishCampDatabase extends Dexie {
  taskProgress!: Table<TaskProgress, string>;
  questionAttempts!: Table<QuestionAttempt, string>;
  studySessions!: Table<StudySession, string>;
  vocabularyProgress!: Table<VocabularyProgress, string>;
  reviewQueue!: Table<ReviewItem, string>;
  userPreferences!: Table<UserPreferences, string>;
  savedWords!: Table<SavedWord, string>;

  constructor() {
    super('EnglishCampDB');

    // Sürüm 1: Çekirdek şemalar
    this.version(1).stores({
      taskProgress: '&taskId, dayNumber, status, lastUpdated',
      questionAttempts: '&id, questionId, taskId, isCorrect, answeredAt',
      studySessions: '&id, date',
      vocabularyProgress: '&wordId, status, nextReviewDate',
      reviewQueue: '&id, type, dueAt, referenceId',
      userPreferences: '&id',
    });

    // Sürüm 2: Bilinmeyen Kelimeler & Kelime Defteri
    this.version(2).stores({
      savedWords: '&id, word, sourceLessonId, sourceType, status, createdAt, isFavorite',
    });
  }
}

export const db = new EnglishCampDatabase();
