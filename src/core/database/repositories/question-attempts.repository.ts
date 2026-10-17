import { db } from '../app.database';
import type { QuestionAttempt } from '../../domain/types';

export const questionAttemptsRepository = {
  async getAll(): Promise<QuestionAttempt[]> {
    return await db.questionAttempts.toArray();
  },

  async getByTask(taskId: string): Promise<QuestionAttempt[]> {
    return await db.questionAttempts.where('taskId').equals(taskId).toArray();
  },

  async recordAttempt(attempt: Omit<QuestionAttempt, 'id' | 'answeredAt'>): Promise<QuestionAttempt> {
    const fullAttempt: QuestionAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      answeredAt: new Date().toISOString(),
    };
    await db.questionAttempts.put(fullAttempt);
    return fullAttempt;
  },

  async clearAll(): Promise<void> {
    await db.questionAttempts.clear();
  },
};
