import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../core/database/app.database';
import { taskProgressRepository } from '../../core/database/repositories/task-progress.repository';
import { questionAttemptsRepository } from '../../core/database/repositories/question-attempts.repository';
import { getCurriculum, getDayDefinition } from '../../core/content/curriculum.loader';
import { plannerEngine } from '../../core/engines/planner.engine';

describe('Daily Task Flow & IndexedDB Persistence', () => {
  beforeEach(async () => {
    await db.taskProgress.clear();
    await db.questionAttempts.clear();
  });

  it('müfredat şemaya uygun şekilde yüklenmeli ve 18 Günde Kamp yapısını içermelidir', () => {
    const camp = getCurriculum();
    expect(camp.isSample).toBe(false);
    expect(camp.title).toContain('18 Günde');
    expect(camp.days.length).toBeGreaterThanOrEqual(1);

    const day1 = getDayDefinition(1);
    expect(day1).toBeDefined();
    expect(day1?.tasks.length).toBeGreaterThan(0);
    expect(day1?.tasks[0].lessonId).toBe('grammar-tenses-1');
  });

  it('görev başlatıldığında in_progress olarak IndexedDB ye yazılmalı ve sayfa yenilendiğinde korunmalıdır', async () => {
    const taskId = 'd1-t1-grammar';
    const dayNumber = 1;

    // Görevi başlat
    const started = await taskProgressRepository.startTask(taskId, dayNumber);
    expect(started.status).toBe('in_progress');
    expect(started.startedAt).toBeDefined();

    // Veritabanından bağımsız olarak tekrar oku (sayfa yenileme simülasyonu)
    const persisted = await taskProgressRepository.getById(taskId);
    expect(persisted).toBeDefined();
    expect(persisted?.status).toBe('in_progress');
    expect(persisted?.dayNumber).toBe(1);
  });

  it('görev tamamlandığında completed olarak IndexedDB ye yazılmalı ve skoru kaydedilmelidir', async () => {
    const taskId = 'd1-t1-grammar';
    const dayNumber = 1;

    // Önce başlat, sonra tamamla
    await taskProgressRepository.startTask(taskId, dayNumber);
    await taskProgressRepository.completeTask(taskId, dayNumber, 85, 1200);

    // IndexedDB'den kontrol et
    const persisted = await taskProgressRepository.getById(taskId);
    expect(persisted).toBeDefined();
    expect(persisted?.status).toBe('completed');
    expect(persisted?.score).toBe(85);
    expect(persisted?.timeSpentSeconds).toBe(1200);
    expect(persisted?.completedAt).toBeDefined();

    // Tamamlanmış görev tekrar açılabilir ve sıfırlanabilir
    await taskProgressRepository.resetTask(taskId, dayNumber);
    const resetItem = await taskProgressRepository.getById(taskId);
    expect(resetItem?.status).toBe('not_started');
    expect(resetItem?.completedAt).toBeUndefined();
  });

  it('soru çözümleri kaydedildiğinde geçmiş korunmalı ve aynı soruya tekrar cevap verilebilmelidir', async () => {
    const taskId = 'd1-t1-grammar';

    // 1. deneme: yanlış
    await questionAttemptsRepository.recordAttempt({
      taskId,
      questionId: 'q-tense-1',
      isCorrect: false,
      submittedAnswer: 'A',
    });

    // 2. deneme: doğru
    await questionAttemptsRepository.recordAttempt({
      taskId,
      questionId: 'q-tense-1',
      isCorrect: true,
      submittedAnswer: 'C',
    });

    const attempts = await questionAttemptsRepository.getByTask(taskId);
    expect(attempts.length).toBe(2);
    expect(attempts.some((a) => !a.isCorrect && a.submittedAnswer === 'A')).toBe(true);
    expect(attempts.some((a) => a.isCorrect && a.submittedAnswer === 'C')).toBe(true);
  });

  it('günlük ilerleme hesabı IndexedDB deki güncel durumla anında senkronize olmalıdır', async () => {
    const day1 = getDayDefinition(1)!;

    // Hiçbir görev yapılmamışken
    let currentProgress = await taskProgressRepository.getAll();
    let dayResult = plannerEngine.calculateDayProgress(day1, currentProgress);
    expect(dayResult.progressPercentage).toBe(0);

    // Gün 1'in tüm zorunlu görevlerini tek tek tamamla
    const requiredTasks = day1.tasks.filter((t) => t.required);
    for (const task of requiredTasks) {
      await taskProgressRepository.completeTask(task.id, 1);
    }

    // Yeni durumu al
    currentProgress = await taskProgressRepository.getAll();
    dayResult = plannerEngine.calculateDayProgress(day1, currentProgress);

    expect(dayResult.completedRequiredTasks).toBe(requiredTasks.length);
    expect(dayResult.progressPercentage).toBe(100);
    expect(dayResult.isCompleted).toBe(true);
  });

  it('bölümler ayrı ayrı tamamlanabilmeli, sıfırlanabilmeli ve ancak tüm bölümler bittiğinde gün tamamlanmalıdır', async () => {
    const dayNumber = 0;
    const parts = [
      'grammar-video-6v2FwwZqb18',
      'grammar-video-dDApCZTBSEk',
      'grammar-video-tWnOq-_MQxY',
    ];

    // 1. Bölümü tamamla
    await taskProgressRepository.completeTask(`grammar-part-${parts[0]}`, dayNumber, 100);
    let p1 = await taskProgressRepository.getById(`grammar-part-${parts[0]}`);
    expect(p1?.status).toBe('completed');

    // 2. ve 3. henüz tamamlanmadı
    let p2 = await taskProgressRepository.getById(`grammar-part-${parts[1]}`);
    let p3 = await taskProgressRepository.getById(`grammar-part-${parts[2]}`);
    expect(p2).toBeUndefined();
    expect(p3).toBeUndefined();

    // 1. Bölümü sıfırla
    await taskProgressRepository.resetTask(`grammar-part-${parts[0]}`, dayNumber);
    p1 = await taskProgressRepository.getById(`grammar-part-${parts[0]}`);
    expect(p1?.status).toBe('not_started');

    // Tüm bölümleri tamamla
    for (const p of parts) {
      await taskProgressRepository.completeTask(`grammar-part-${p}`, dayNumber, 100);
    }
    await taskProgressRepository.completeTask(`d${dayNumber}-t1-grammar`, dayNumber, 100);

    const allRecords = await taskProgressRepository.getAll();
    const allPartsDone = parts.every((p) =>
      allRecords.some((r) => r.taskId === `grammar-part-${p}` && r.status === 'completed')
    );
    expect(allPartsDone).toBe(true);

    const dayTask = await taskProgressRepository.getById(`d${dayNumber}-t1-grammar`);
    expect(dayTask?.status).toBe('completed');
  });
});
