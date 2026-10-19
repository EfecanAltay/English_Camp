import { db } from '../database/app.database';
import { BackupDataSchema } from '../domain/schemas';
import type { BackupData } from '../domain/types';

export const backupService = {
  /**
   * IndexedDB'deki tüm tabloları dışa aktarılabilir JSON nesnesine dönüştürür.
   */
  async exportBackup(): Promise<string> {
    const [
      taskProgress,
      questionAttempts,
      studySessions,
      vocabularyProgress,
      reviewQueue,
      userPreferences,
      savedWords,
    ] = await Promise.all([
      db.taskProgress.toArray(),
      db.questionAttempts.toArray(),
      db.studySessions.toArray(),
      db.vocabularyProgress.toArray(),
      db.reviewQueue.toArray(),
      db.userPreferences.toArray(),
      db.savedWords.toArray(),
    ]);

    const backupPayload: BackupData = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      data: {
        taskProgress,
        questionAttempts,
        studySessions,
        vocabularyProgress,
        reviewQueue,
        userPreferences,
        savedWords,
      },
    };

    return JSON.stringify(backupPayload, null, 2);
  },

  /**
   * Bir JSON metnini doğrular ve IndexedDB'ye atomik bir transaction ile geri yükler.
   * Bozuk JSON veya şema uyumsuzluğunda mevcut veriye ASLA dokunmaz.
   */
  async importBackup(jsonString: string): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> {
    let rawData: unknown;
    try {
      rawData = JSON.parse(jsonString);
    } catch {
      return { success: false, message: 'Geçersiz JSON formatı. Dosya okunamadı.' };
    }

    const validationResult = BackupDataSchema.safeParse(rawData);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0]?.message || 'Bilinmeyen şema hatası';
      return { success: false, message: `Yedek veri şeması geçersiz: ${issue}` };
    }

    const validBackup = validationResult.data;

    try {
      // Dexie atomik transaction: Herhangi bir hata olursa rollback gerçekleşir.
      await db.transaction(
        'rw',
        [
          db.taskProgress,
          db.questionAttempts,
          db.studySessions,
          db.vocabularyProgress,
          db.reviewQueue,
          db.userPreferences,
          db.savedWords,
        ],
        async () => {
          // Önceki verileri temizle
          await Promise.all([
            db.taskProgress.clear(),
            db.questionAttempts.clear(),
            db.studySessions.clear(),
            db.vocabularyProgress.clear(),
            db.reviewQueue.clear(),
            db.userPreferences.clear(),
            db.savedWords.clear(),
          ]);

          // Yeni verileri yükle
          if (validBackup.data.taskProgress.length > 0) {
            await db.taskProgress.bulkPut(validBackup.data.taskProgress);
          }
          if (validBackup.data.questionAttempts.length > 0) {
            await db.questionAttempts.bulkPut(validBackup.data.questionAttempts);
          }
          if (validBackup.data.studySessions.length > 0) {
            await db.studySessions.bulkPut(validBackup.data.studySessions);
          }
          if (validBackup.data.vocabularyProgress.length > 0) {
            await db.vocabularyProgress.bulkPut(validBackup.data.vocabularyProgress);
          }
          if (validBackup.data.reviewQueue.length > 0) {
            await db.reviewQueue.bulkPut(validBackup.data.reviewQueue);
          }
          if (validBackup.data.userPreferences.length > 0) {
            await db.userPreferences.bulkPut(validBackup.data.userPreferences);
          }
          if (validBackup.data.savedWords && validBackup.data.savedWords.length > 0) {
            await db.savedWords.bulkPut(validBackup.data.savedWords);
          }
        }
      );

      return {
        success: true,
        message: 'Yedek başarıyla geri yüklendi.',
        counts: {
          tasks: validBackup.data.taskProgress.length,
          attempts: validBackup.data.questionAttempts.length,
          savedWords: validBackup.data.savedWords?.length || 0,
        },
      };
    } catch (err) {
      return {
        success: false,
        message: `Geri yükleme sırasında veritabanı hatası oluştu: ${(err as Error).message}`,
      };
    }
  },

  /**
   * Tüm veritabanını sıfırlar (çift onaylı ayarlar için).
   */
  async resetAllData(): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.taskProgress,
        db.questionAttempts,
        db.studySessions,
        db.vocabularyProgress,
        db.reviewQueue,
        db.userPreferences,
        db.savedWords,
      ],
      async () => {
        await Promise.all([
          db.taskProgress.clear(),
          db.questionAttempts.clear(),
          db.studySessions.clear(),
          db.vocabularyProgress.clear(),
          db.reviewQueue.clear(),
          db.userPreferences.clear(),
          db.savedWords.clear(),
        ]);
      }
    );
  },
};
