import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/database/app.database';
import { taskProgressRepository } from '../core/database/repositories/task-progress.repository';
import { questionAttemptsRepository } from '../core/database/repositories/question-attempts.repository';
import { getCurriculum, getDayDefinition } from '../core/content/curriculum.loader';
import { plannerEngine, type DayProgressResult } from '../core/engines/planner.engine';
import { progressEngine } from '../core/engines/progress.engine';
import type { TaskProgress, QuestionAttempt } from '../core/domain/types';

export function useCampProgress() {
  const curriculum = getCurriculum();

  // Dexie reaktif sorguları
  const allProgress = useLiveQuery<TaskProgress[]>(() => db.taskProgress.toArray(), []) || [];
  const allAttempts = useLiveQuery<QuestionAttempt[]>(() => db.questionAttempts.toArray(), []) || [];

  // Genel Kamp İlerlemesi
  const overall = plannerEngine.calculateCampOverallProgress(curriculum.days, allProgress);

  // Doğruluk oranı ve çalışma metrikleri
  const accuracy = progressEngine.calculateAccuracy(allAttempts);
  const totalMinutesSpent = progressEngine.calculateTotalTimeSpentMinutes(allProgress);

  // Belirli bir günün ilerlemesini al
  const getDayProgress = (dayNumber: number): DayProgressResult | null => {
    const day = getDayDefinition(dayNumber);
    if (!day) return null;
    return plannerEngine.calculateDayProgress(day, allProgress);
  };

  // Görevi başlat
  const startTask = async (taskId: string, dayNumber: number) => {
    await taskProgressRepository.startTask(taskId, dayNumber);
  };

  // Görevi tamamla
  const completeTask = async (
    taskId: string,
    dayNumber: number,
    score?: number,
    timeSpentSeconds?: number
  ) => {
    await taskProgressRepository.completeTask(taskId, dayNumber, score, timeSpentSeconds);
  };

  // Görevi sıfırla / tekrar başlat
  const resetTask = async (taskId: string, dayNumber: number) => {
    await taskProgressRepository.resetTask(taskId, dayNumber);
  };

  // Soru denemesi kaydet
  const recordQuestionAttempt = async (
    taskId: string,
    questionId: string,
    isCorrect: boolean,
    submittedAnswer: unknown,
    durationMs?: number
  ) => {
    await questionAttemptsRepository.recordAttempt({
      taskId,
      questionId,
      isCorrect,
      submittedAnswer,
      durationMs,
    });
  };

  return {
    curriculum,
    allProgress,
    allAttempts,
    overall,
    accuracy,
    totalMinutesSpent,
    getDayProgress,
    startTask,
    completeTask,
    resetTask,
    recordQuestionAttempt,
  };
}
