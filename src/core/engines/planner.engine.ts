import type { CampDayDefinition, DailyTaskDefinition, TaskProgress } from '../domain/types';

export interface DayProgressResult {
  dayNumber: number;
  totalTasks: number;
  completedTasks: number;
  requiredTasks: number;
  completedRequiredTasks: number;
  optionalTasks: number;
  completedOptionalTasks: number;
  progressPercentage: number; // 0 - 100 (zorunlu görevlere göre)
  isCompleted: boolean;
  estimatedMinutesTotal: number;
  timeSpentSecondsTotal: number;
  averageScore?: number;
}

export const plannerEngine = {
  /**
   * Bir günün görev ilerlemesini hesaplar.
   * Günlük ilerleme yüzdesi = tamamlanan zorunlu görev / toplam zorunlu görev × 100.
   */
  calculateDayProgress(
    day: CampDayDefinition,
    progressList: TaskProgress[]
  ): DayProgressResult {
    const progressMap = new Map<string, TaskProgress>();
    for (const p of progressList) {
      progressMap.set(p.taskId, p);
    }

    const totalTasks = day.tasks.length;
    const requiredTasks = day.tasks.filter((t) => t.required);
    const optionalTasks = day.tasks.filter((t) => !t.required);

    let completedTasks = 0;
    let completedRequiredTasks = 0;
    let completedOptionalTasks = 0;
    let timeSpentSecondsTotal = 0;
    let totalScore = 0;
    let scoredTaskCount = 0;

    for (const task of day.tasks) {
      const p = progressMap.get(task.id);
      if (p) {
        if (p.timeSpentSeconds) {
          timeSpentSecondsTotal += p.timeSpentSeconds;
        }
        if (p.status === 'completed') {
          completedTasks++;
          if (task.required) {
            completedRequiredTasks++;
          } else {
            completedOptionalTasks++;
          }
          if (p.score !== undefined) {
            totalScore += p.score;
            scoredTaskCount++;
          }
        }
      }
    }

    // Yüzde hesabı: Zorunlu görevler varsa zorunlu görevlere göre, yoksa tüm görevlere göre
    let progressPercentage = 0;
    if (requiredTasks.length > 0) {
      progressPercentage = Math.round((completedRequiredTasks / requiredTasks.length) * 100);
    } else if (totalTasks > 0) {
      progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    }

    const isCompleted = requiredTasks.length > 0 
      ? completedRequiredTasks === requiredTasks.length 
      : (totalTasks > 0 && completedTasks === totalTasks);

    const estimatedMinutesTotal = day.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    return {
      dayNumber: day.dayNumber,
      totalTasks,
      completedTasks,
      requiredTasks: requiredTasks.length,
      completedRequiredTasks,
      optionalTasks: optionalTasks.length,
      completedOptionalTasks,
      progressPercentage,
      isCompleted,
      estimatedMinutesTotal,
      timeSpentSecondsTotal,
      averageScore: scoredTaskCount > 0 ? Math.round(totalScore / scoredTaskCount) : undefined,
    };
  },

  /**
   * Tüm kamp günlerinin genel ilerlemesini hesaplar.
   */
  calculateCampOverallProgress(
    days: CampDayDefinition[],
    allProgress: TaskProgress[]
  ): {
    overallPercentage: number;
    completedDaysCount: number;
    totalDaysCount: number;
    totalRequiredTasks: number;
    completedRequiredTasks: number;
    totalCompletedTasks: number;
    totalTasks: number;
  } {
    let totalRequiredTasks = 0;
    let completedRequiredTasks = 0;
    let totalCompletedTasks = 0;
    let totalTasks = 0;
    let completedDaysCount = 0;

    for (const day of days) {
      const dayResult = this.calculateDayProgress(day, allProgress);
      totalTasks += dayResult.totalTasks;
      totalCompletedTasks += dayResult.completedTasks;
      totalRequiredTasks += dayResult.requiredTasks;
      completedRequiredTasks += dayResult.completedRequiredTasks;

      if (dayResult.isCompleted) {
        completedDaysCount++;
      }
    }

    let overallPercentage = 0;
    if (totalRequiredTasks > 0) {
      overallPercentage = Math.round((completedRequiredTasks / totalRequiredTasks) * 100);
    } else if (totalTasks > 0) {
      overallPercentage = Math.round((totalCompletedTasks / totalTasks) * 100);
    }

    return {
      overallPercentage,
      completedDaysCount,
      totalDaysCount: days.length,
      totalRequiredTasks,
      completedRequiredTasks,
      totalCompletedTasks,
      totalTasks,
    };
  },

  /**
   * Görevin durumunu getirir.
   */
  getTaskStatus(task: DailyTaskDefinition, progressList: TaskProgress[]): {
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    timeSpentSeconds?: number;
  } {
    const p = progressList.find((item) => item.taskId === task.id);
    if (!p) {
      return { status: 'not_started' };
    }
    return {
      status: p.status,
      score: p.score,
      timeSpentSeconds: p.timeSpentSeconds,
    };
  },
};
