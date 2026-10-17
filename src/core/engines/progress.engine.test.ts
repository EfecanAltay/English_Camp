import { describe, it, expect } from 'vitest';
import { progressEngine } from './progress.engine';
import type { QuestionAttempt, TaskProgress } from '../domain/types';

describe('progressEngine', () => {
  it('soru denemesi olmadığında doğruluk 0% ve 0 deneme dönmelidir', () => {
    const accuracy = progressEngine.calculateAccuracy([]);
    expect(accuracy.totalAttempts).toBe(0);
    expect(accuracy.correctAttempts).toBe(0);
    expect(accuracy.accuracyPercentage).toBe(0);
  });

  it('soru denemelerine göre başarı oranını görev tamamlanmasından tamamen bağımsız hesaplamalıdır', () => {
    // 4 sorudan 3'ü doğru: 3/4 = %75
    const attempts: QuestionAttempt[] = [
      { id: '1', questionId: 'q1', taskId: 't1', isCorrect: true, answeredAt: new Date().toISOString() },
      { id: '2', questionId: 'q2', taskId: 't1', isCorrect: false, answeredAt: new Date().toISOString() },
      { id: '3', questionId: 'q3', taskId: 't1', isCorrect: true, answeredAt: new Date().toISOString() },
      { id: '4', questionId: 'q4', taskId: 't1', isCorrect: true, answeredAt: new Date().toISOString() },
    ];

    const accuracy = progressEngine.calculateAccuracy(attempts);
    expect(accuracy.totalAttempts).toBe(4);
    expect(accuracy.correctAttempts).toBe(3);
    expect(accuracy.accuracyPercentage).toBe(75);
  });

  it('aynı sorunun birden fazla denemesi doğru şekilde kaydedilip hesaplanır', () => {
    // Aynı soruya iki kez cevap verilmiş: ilki yanlış, ikincisi doğru. Toplam 2 deneme, 1 doğru (%50)
    const attempts: QuestionAttempt[] = [
      { id: '1', questionId: 'q1', taskId: 't1', isCorrect: false, answeredAt: '2026-10-17T01:00:00Z' },
      { id: '2', questionId: 'q1', taskId: 't1', isCorrect: true, answeredAt: '2026-10-17T01:05:00Z' },
    ];

    const accuracy = progressEngine.calculateAccuracy(attempts);
    expect(accuracy.totalAttempts).toBe(2);
    expect(accuracy.correctAttempts).toBe(1);
    expect(accuracy.accuracyPercentage).toBe(50);
  });

  it('toplam çalışma süresini saniyelerden dakikaya doğru yuvarlamalıdır', () => {
    const progressList: TaskProgress[] = [
      { taskId: 't1', dayNumber: 1, status: 'completed', timeSpentSeconds: 120, lastUpdated: '' }, // 2 dk
      { taskId: 't2', dayNumber: 1, status: 'completed', timeSpentSeconds: 300, lastUpdated: '' }, // 5 dk
      { taskId: 't3', dayNumber: 1, status: 'in_progress', timeSpentSeconds: 90, lastUpdated: '' }, // 1.5 dk
    ];

    // Toplam 510 sn = 8.5 dk -> round: 9 dk
    const totalMinutes = progressEngine.calculateTotalTimeSpentMinutes(progressList);
    expect(totalMinutes).toBe(9);
  });
});
