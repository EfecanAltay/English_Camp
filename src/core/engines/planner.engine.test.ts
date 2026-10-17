import { describe, it, expect } from 'vitest';
import { plannerEngine } from './planner.engine';
import type { CampDayDefinition, TaskProgress } from '../domain/types';

describe('plannerEngine', () => {
  const sampleDay: CampDayDefinition = {
    id: 'day-test-1',
    dayNumber: 1,
    title: 'Test Günü',
    description: 'Test açıklaması',
    tasks: [
      {
        id: 't1',
        module: 'grammar',
        lessonId: 'l1',
        title: 'Grammar Task (Required)',
        estimatedMinutes: 30,
        required: true,
      },
      {
        id: 't2',
        module: 'vocabulary',
        lessonId: 'l2',
        title: 'Vocab Task (Required)',
        estimatedMinutes: 20,
        required: true,
      },
      {
        id: 't3',
        module: 'skills',
        lessonId: 'l3',
        title: 'Skills Task (Optional)',
        estimatedMinutes: 15,
        required: false,
      },
    ],
  };

  it('görevler henüz başlamadıysa ilerleme 0% ve tamamlanmamış olmalıdır', () => {
    const progressList: TaskProgress[] = [];
    const result = plannerEngine.calculateDayProgress(sampleDay, progressList);

    expect(result.dayNumber).toBe(1);
    expect(result.totalTasks).toBe(3);
    expect(result.requiredTasks).toBe(2);
    expect(result.completedRequiredTasks).toBe(0);
    expect(result.progressPercentage).toBe(0);
    expect(result.isCompleted).toBe(false);
  });

  it('yalnızca 1 zorunlu görev tamamlandığında ilerleme %50 olmalıdır (2 zorunlu görevden 1 tanesi)', () => {
    const progressList: TaskProgress[] = [
      {
        taskId: 't1',
        dayNumber: 1,
        status: 'completed',
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ];

    const result = plannerEngine.calculateDayProgress(sampleDay, progressList);

    expect(result.completedRequiredTasks).toBe(1);
    expect(result.completedTasks).toBe(1);
    expect(result.progressPercentage).toBe(50);
    expect(result.isCompleted).toBe(false);
  });

  it('seçmeli görev tamamlandığında zorunlu görev yüzdesini bozmamalıdır', () => {
    const progressList: TaskProgress[] = [
      {
        taskId: 't3', // Seçmeli
        dayNumber: 1,
        status: 'completed',
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ];

    const result = plannerEngine.calculateDayProgress(sampleDay, progressList);

    expect(result.completedTasks).toBe(1);
    expect(result.completedOptionalTasks).toBe(1);
    expect(result.completedRequiredTasks).toBe(0);
    // Yüzde zorunlu görevlere göre hesaplandığından %0 kalmalı
    expect(result.progressPercentage).toBe(0);
    expect(result.isCompleted).toBe(false);
  });

  it('tüm zorunlu görevler bittiğinde gün %100 ve isCompleted: true olmalıdır', () => {
    const progressList: TaskProgress[] = [
      {
        taskId: 't1',
        dayNumber: 1,
        status: 'completed',
        lastUpdated: new Date().toISOString(),
      },
      {
        taskId: 't2',
        dayNumber: 1,
        status: 'completed',
        lastUpdated: new Date().toISOString(),
      },
    ];

    const result = plannerEngine.calculateDayProgress(sampleDay, progressList);

    expect(result.completedRequiredTasks).toBe(2);
    expect(result.progressPercentage).toBe(100);
    expect(result.isCompleted).toBe(true);
  });

  it('tüm kamp genel ilerlemesini doğru hesaplamalıdır', () => {
    const day2: CampDayDefinition = {
      id: 'day-test-2',
      dayNumber: 2,
      title: 'Test Günü 2',
      description: 'Test',
      tasks: [
        {
          id: 't4',
          module: 'reading',
          lessonId: 'l4',
          title: 'Reading Task',
          estimatedMinutes: 20,
          required: true,
        },
      ],
    };

    // Gün 1'in 2 zorunlu görevi var, Gün 2'nin 1 zorunlu görevi var. Toplam 3 zorunlu görev.
    // 2 tanesi tamamlandıysa: 2/3 = %67
    const progressList: TaskProgress[] = [
      { taskId: 't1', dayNumber: 1, status: 'completed', lastUpdated: new Date().toISOString() },
      { taskId: 't2', dayNumber: 1, status: 'completed', lastUpdated: new Date().toISOString() },
    ];

    const overall = plannerEngine.calculateCampOverallProgress([sampleDay, day2], progressList);

    expect(overall.totalDaysCount).toBe(2);
    expect(overall.completedDaysCount).toBe(1);
    expect(overall.totalRequiredTasks).toBe(3);
    expect(overall.completedRequiredTasks).toBe(2);
    expect(overall.overallPercentage).toBe(67);
  });
});
