export type ModuleType = 'grammar' | 'vocabulary' | 'reading' | 'skills';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export type ReviewItemType = 'question' | 'word';

export interface DailyTaskDefinition {
  id: string;
  module: ModuleType;
  lessonId: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  targetCount?: number;
  required: boolean;
}

export interface CampDayDefinition {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  tasks: DailyTaskDefinition[];
}

export interface CampDefinition {
  id: string;
  title: string;
  version: string;
  totalDays: number;
  isSample: boolean;
  sampleDisclaimer: string;
  days: CampDayDefinition[];
}

export interface TaskProgress {
  taskId: string;
  dayNumber: number;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number; // 0 - 100
  timeSpentSeconds?: number;
  lastUpdated: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  taskId: string;
  sessionId?: string;
  submittedAnswer?: unknown;
  isCorrect: boolean;
  answeredAt: string;
  durationMs?: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  tasksCompleted: number;
  updatedAt: string;
}

export interface VocabularyProgress {
  wordId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  nextReviewDate: string; // ISO string
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  sourceRef?: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  referenceId: string; // questionId or wordId
  wrongCount: number;
  lastReviewedAt: string;
  dueAt: string;
}

export interface UserPreferences {
  id: string;
  theme: 'light' | 'dark' | 'system';
  dailyGoalMinutes: number;
  activeCampId: string;
  lastActiveDay: number;
  updatedAt: string;
}

export type WordPartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrasal_verb'
  | 'preposition'
  | 'conjunction'
  | 'phrase'
  | 'other';

export interface SavedWord {
  id: string;
  word: string;
  meaning: string;
  synonyms: string[];
  antonyms?: string[];
  partOfSpeech?: WordPartOfSpeech;
  exampleSentence?: string;
  exampleTranslation?: string;
  sourceLessonId?: string;
  sourceLessonTitle?: string;
  sourceType?: 'grammar' | 'reading' | 'vocabulary' | 'manual';
  videoTimestampSeconds?: number;
  notes?: string;
  status: 'learning' | 'mastered';
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  data: {
    taskProgress: TaskProgress[];
    questionAttempts: QuestionAttempt[];
    studySessions: StudySession[];
    vocabularyProgress: VocabularyProgress[];
    reviewQueue: ReviewItem[];
    userPreferences: UserPreferences[];
    savedWords?: SavedWord[];
  };
}
