import type { QuestionAttempt, TaskProgress } from '../domain/types';

export interface AccuracyMetrics {
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercentage: number; // 0 - 100
}

export interface OverallStudyMetrics {
  totalTasksCompleted: number;
  totalTimeSpentMinutes: number;
  accuracy: AccuracyMetrics;
  estimatedTotalCampHours: number;
}

export const progressEngine = {
  /**
   * Doğruluk oranını soru girişimlerinden bağımsız olarak hesaplar.
   * Görev tamamlama oranından tamamen bağımsızdır.
   */
  calculateAccuracy(attempts: QuestionAttempt[]): AccuracyMetrics {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        correctAttempts: 0,
        accuracyPercentage: 0,
      };
    }

    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const accuracyPercentage = Math.round((correctAttempts / attempts.length) * 100);

    return {
      totalAttempts: attempts.length,
      correctAttempts,
      accuracyPercentage,
    };
  },

  /**
   * Toplam harcanan süreyi dakika cinsinden hesaplar.
   */
  calculateTotalTimeSpentMinutes(progressList: TaskProgress[]): number {
    const totalSeconds = progressList.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    return Math.round(totalSeconds / 60);
  },

  /**
   * Modül bazında görev tamamlama sayıları.
   */
  calculateModuleStats(
    progressList: TaskProgress[],
    taskModuleMap: Record<string, 'grammar' | 'vocabulary' | 'reading' | 'skills'>
  ): Record<'grammar' | 'vocabulary' | 'reading' | 'skills', { completed: number; inProgress: number }> {
    const stats = {
      grammar: { completed: 0, inProgress: 0 },
      vocabulary: { completed: 0, inProgress: 0 },
      reading: { completed: 0, inProgress: 0 },
      skills: { completed: 0, inProgress: 0 },
    };

    for (const p of progressList) {
      const module = taskModuleMap[p.taskId];
      if (module && stats[module]) {
        if (p.status === 'completed') {
          stats[module].completed++;
        } else if (p.status === 'in_progress') {
          stats[module].inProgress++;
        }
      }
    }

    return stats;
  },
};
