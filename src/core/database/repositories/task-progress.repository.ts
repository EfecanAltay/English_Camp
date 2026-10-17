import { db } from '../app.database';
import type { TaskProgress, TaskStatus } from '../../domain/types';

export const taskProgressRepository = {
  async getAll(): Promise<TaskProgress[]> {
    return await db.taskProgress.toArray();
  },

  async getById(taskId: string): Promise<TaskProgress | undefined> {
    return await db.taskProgress.get(taskId);
  },

  async getByDay(dayNumber: number): Promise<TaskProgress[]> {
    return await db.taskProgress.where('dayNumber').equals(dayNumber).toArray();
  },

  async upsert(progress: TaskProgress): Promise<void> {
    await db.taskProgress.put({
      ...progress,
      lastUpdated: new Date().toISOString(),
    });
  },

  async setStatus(taskId: string, dayNumber: number, status: TaskStatus, score?: number): Promise<TaskProgress> {
    const existing = await db.taskProgress.get(taskId);
    const now = new Date().toISOString();

    const updated: TaskProgress = {
      taskId,
      dayNumber,
      status,
      startedAt: existing?.startedAt || (status === 'in_progress' ? now : undefined),
      completedAt: status === 'completed' ? now : (status === 'not_started' ? undefined : existing?.completedAt),
      score: score !== undefined ? score : existing?.score,
      timeSpentSeconds: existing?.timeSpentSeconds || 0,
      lastUpdated: now,
    };

    await db.taskProgress.put(updated);
    return updated;
  },

  async startTask(taskId: string, dayNumber: number): Promise<TaskProgress> {
    return this.setStatus(taskId, dayNumber, 'in_progress');
  },

  async completeTask(taskId: string, dayNumber: number, score?: number, timeSpentSeconds?: number): Promise<TaskProgress> {
    const existing = await db.taskProgress.get(taskId);
    const now = new Date().toISOString();

    const updated: TaskProgress = {
      taskId,
      dayNumber,
      status: 'completed',
      startedAt: existing?.startedAt || now,
      completedAt: now,
      score: score !== undefined ? score : (existing?.score ?? 100),
      timeSpentSeconds: (existing?.timeSpentSeconds || 0) + (timeSpentSeconds || 0),
      lastUpdated: now,
    };

    await db.taskProgress.put(updated);
    return updated;
  },

  async resetTask(taskId: string, dayNumber: number): Promise<TaskProgress> {
    const now = new Date().toISOString();
    const updated: TaskProgress = {
      taskId,
      dayNumber,
      status: 'not_started',
      startedAt: undefined,
      completedAt: undefined,
      score: undefined,
      timeSpentSeconds: 0,
      lastUpdated: now,
    };

    await db.taskProgress.put(updated);
    return updated;
  },

  async clearAll(): Promise<void> {
    await db.taskProgress.clear();
  },
};
