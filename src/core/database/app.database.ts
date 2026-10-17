import Dexie, { type Table } from 'dexie';
import type {
  TaskProgress,
  QuestionAttempt,
  StudySession,
  VocabularyProgress,
  ReviewItem,
  UserPreferences,
} from '../domain/types';

export class EnglishCampDatabase extends Dexie {
  taskProgress!: Table<TaskProgress, string>;
  questionAttempts!: Table<QuestionAttempt, string>;
  studySessions!: Table<StudySession, string>;
  vocabularyProgress!: Table<VocabularyProgress, string>;
  reviewQueue!: Table<ReviewItem, string>;
  userPreferences!: Table<UserPreferences, string>;

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
  }
}

export const db = new EnglishCampDatabase();
