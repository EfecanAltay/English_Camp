import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/app.database';
import { backupService } from './backup.service';
import type { TaskProgress, QuestionAttempt } from '../domain/types';

describe('backupService', () => {
  beforeEach(async () => {
    // Test öncesi tabloları sıfırla
    await db.taskProgress.clear();
    await db.questionAttempts.clear();
  });

  it('IndexedDB verilerini JSON olarak export eder ve geri import döngüsünü korur', async () => {
    // 1. Veritabanına başlangıç verisi ekle
    const sampleTask: TaskProgress = {
      taskId: 'd1-t1-grammar',
      dayNumber: 1,
      status: 'completed',
      score: 95,
      timeSpentSeconds: 600,
      completedAt: '2026-10-17T01:30:00Z',
      lastUpdated: '2026-10-17T01:30:00Z',
    };
    await db.taskProgress.put(sampleTask);

    const sampleAttempt: QuestionAttempt = {
      id: 'attempt-1',
      questionId: 'q-101',
      taskId: 'd1-t1-grammar',
      isCorrect: true,
      answeredAt: '2026-10-17T01:25:00Z',
    };
    await db.questionAttempts.put(sampleAttempt);

    // 2. Export al
    const exportedJson = await backupService.exportBackup();
    expect(exportedJson).toContain('d1-t1-grammar');
    expect(exportedJson).toContain('q-101');

    // 3. Veritabanını temizle
    await db.taskProgress.clear();
    await db.questionAttempts.clear();
    expect(await db.taskProgress.count()).toBe(0);

    // 4. İçe aktar (Restore)
    const restoreResult = await backupService.importBackup(exportedJson);
    expect(restoreResult.success).toBe(true);

    // 5. Geri gelen veriyi doğrula
    const restoredTask = await db.taskProgress.get('d1-t1-grammar');
    expect(restoredTask).toBeDefined();
    expect(restoredTask?.status).toBe('completed');
    expect(restoredTask?.score).toBe(95);

    const restoredAttempt = await db.questionAttempts.get('attempt-1');
    expect(restoredAttempt).toBeDefined();
    expect(restoredAttempt?.isCorrect).toBe(true);
  });

  it('bozuk veya şemaya uymayan JSON içe aktarılmaya çalışıldığında mevcut veriler ASLA silinmez veya bozulmaz', async () => {
    // 1. Mevcut değerli veriyi ekle
    const originalTask: TaskProgress = {
      taskId: 'critical-task-1',
      dayNumber: 1,
      status: 'completed',
      score: 100,
      lastUpdated: new Date().toISOString(),
    };
    await db.taskProgress.put(originalTask);

    // 2. Bozuk JSON ile import dene
    const malformedJson = '{ "brokenJson": true, ';
    const res1 = await backupService.importBackup(malformedJson);
    expect(res1.success).toBe(false);

    // Mevcut veri bozulmamış olmalı
    const taskAfterBrokenJson = await db.taskProgress.get('critical-task-1');
    expect(taskAfterBrokenJson).toBeDefined();
    expect(taskAfterBrokenJson?.status).toBe('completed');

    // 3. Şemaya uymayan (Zod validation fail) geçersiz veri ile import dene
    const invalidSchemaJson = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      data: {
        taskProgress: [
          {
            // taskId eksik, dayNumber string verilmiş (hatalı şema)
            dayNumber: 'INVALID_DAY_NUMBER',
            status: 'unknown_status',
          },
        ],
      },
    });

    const res2 = await backupService.importBackup(invalidSchemaJson);
    expect(res2.success).toBe(false);
    expect(res2.message).toContain('Yedek veri şeması geçersiz');

    // Mevcut veri yine sapasağlam kalmalı!
    const taskAfterInvalidSchema = await db.taskProgress.get('critical-task-1');
    expect(taskAfterInvalidSchema).toBeDefined();
    expect(taskAfterInvalidSchema?.status).toBe('completed');
    expect(taskAfterInvalidSchema?.score).toBe(100);
  });
});
