import { z } from 'zod';

export const ModuleTypeSchema = z.enum(['grammar', 'vocabulary', 'reading', 'skills']);
export const TaskStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);
export const ReviewItemTypeSchema = z.enum(['question', 'word']);

export const DailyTaskDefinitionSchema = z.object({
  id: z.string().min(1),
  module: ModuleTypeSchema,
  lessonId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  estimatedMinutes: z.number().nonnegative(),
  targetCount: z.number().nonnegative().optional(),
  required: z.boolean(),
});

export const CampDayDefinitionSchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().positive(),
  title: z.string().min(1),
  description: z.string(),
  tasks: z.array(DailyTaskDefinitionSchema),
});

export const CampDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  version: z.string().min(1),
  totalDays: z.number().positive(),
  isSample: z.boolean(),
  sampleDisclaimer: z.string(),
  days: z.array(CampDayDefinitionSchema),
});

export const TaskProgressSchema = z.object({
  taskId: z.string().min(1),
  dayNumber: z.number().positive(),
  status: TaskStatusSchema,
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  timeSpentSeconds: z.number().nonnegative().optional(),
  lastUpdated: z.string(),
});

export const QuestionAttemptSchema = z.object({
  id: z.string().min(1),
  questionId: z.string().min(1),
  taskId: z.string().min(1),
  sessionId: z.string().optional(),
  submittedAnswer: z.unknown().optional(),
  isCorrect: z.boolean(),
  answeredAt: z.string(),
  durationMs: z.number().nonnegative().optional(),
});

export const StudySessionSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  durationMinutes: z.number().nonnegative(),
  tasksCompleted: z.number().nonnegative(),
  updatedAt: z.string(),
});

export const VocabularyProgressSchema = z.object({
  wordId: z.string().min(1),
  status: z.enum(['new', 'learning', 'review', 'mastered']),
  nextReviewDate: z.string(),
  interval: z.number().nonnegative(),
  repetitions: z.number().nonnegative(),
  easeFactor: z.number().positive(),
  sourceRef: z.string().optional(),
  updatedAt: z.string(),
});

export const ReviewItemSchema = z.object({
  id: z.string().min(1),
  type: ReviewItemTypeSchema,
  referenceId: z.string().min(1),
  wrongCount: z.number().nonnegative(),
  lastReviewedAt: z.string(),
  dueAt: z.string(),
});

export const UserPreferencesSchema = z.object({
  id: z.string().min(1),
  theme: z.enum(['light', 'dark', 'system']),
  dailyGoalMinutes: z.number().positive(),
  activeCampId: z.string().min(1),
  lastActiveDay: z.number().positive(),
  updatedAt: z.string(),
});

export const WordPartOfSpeechSchema = z.enum([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'phrasal_verb',
  'preposition',
  'conjunction',
  'phrase',
  'other',
]);

export const SavedWordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  meaning: z.string().min(1),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).optional(),
  partOfSpeech: WordPartOfSpeechSchema.optional(),
  exampleSentence: z.string().optional(),
  exampleTranslation: z.string().optional(),
  sourceLessonId: z.string().optional(),
  sourceLessonTitle: z.string().optional(),
  sourceType: z.enum(['grammar', 'reading', 'vocabulary', 'manual']).optional(),
  videoTimestampSeconds: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  status: z.enum(['learning', 'mastered']).default('learning'),
  isFavorite: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BackupDataSchema = z.object({
  schemaVersion: z.number().positive(),
  exportedAt: z.string(),
  appVersion: z.string(),
  data: z.object({
    taskProgress: z.array(TaskProgressSchema).default([]),
    questionAttempts: z.array(QuestionAttemptSchema).default([]),
    studySessions: z.array(StudySessionSchema).default([]),
    vocabularyProgress: z.array(VocabularyProgressSchema).default([]),
    reviewQueue: z.array(ReviewItemSchema).default([]),
    userPreferences: z.array(UserPreferencesSchema).default([]),
    savedWords: z.array(SavedWordSchema).default([]),
  }),
});
