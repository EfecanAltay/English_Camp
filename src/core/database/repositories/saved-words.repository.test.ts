import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../app.database';
import { savedWordsRepository } from './saved-words.repository';

describe('savedWordsRepository', () => {
  beforeEach(async () => {
    await db.savedWords.clear();
  });

  it('yeni bilinmeyen kelimeyi eş anlamlılarıyla birlikte ekler ve getirir', async () => {
    const created = await savedWordsRepository.addWord({
      word: 'reluctant',
      meaning: 'isteksiz, tereddütlü',
      synonyms: ['unwilling', 'hesitant', 'disinclined'],
      antonyms: ['willing', 'eager'],
      partOfSpeech: 'adjective',
      sourceLessonId: 'day-1-tenses',
      sourceLessonTitle: 'Gün 1: Tenses',
      sourceType: 'grammar',
      videoTimestampSeconds: 245,
    });

    expect(created.id).toBeDefined();
    expect(created.word).toBe('reluctant');
    expect(created.meaning).toBe('isteksiz, tereddütlü');
    expect(created.synonyms).toEqual(['unwilling', 'hesitant', 'disinclined']);
    expect(created.antonyms).toEqual(['willing', 'eager']);
    expect(created.videoTimestampSeconds).toBe(245);
    expect(created.status).toBe('learning');

    const fetched = await savedWordsRepository.getById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.word).toBe('reluctant');
  });

  it('derse ait kelimeleri filtreleyebilir (getByLessonId)', async () => {
    await savedWordsRepository.addWord({
      word: 'adhere to',
      meaning: 'bağlı kalmak, uymak',
      synonyms: ['comply with', 'abide by'],
      sourceLessonId: 'day-1-tenses',
      sourceType: 'grammar',
    });

    await savedWordsRepository.addWord({
      word: 'scrutinize',
      meaning: 'dikkatle incelemek',
      synonyms: ['examine', 'inspect'],
      sourceLessonId: 'day-2-modals',
      sourceType: 'grammar',
    });

    const day1Words = await savedWordsRepository.getByLessonId('day-1-tenses');
    expect(day1Words.length).toBe(1);
    expect(day1Words[0].word).toBe('adhere to');

    const day2Words = await savedWordsRepository.getByLessonId('day-2-modals');
    expect(day2Words.length).toBe(1);
    expect(day2Words[0].word).toBe('scrutinize');
  });

  it('kelime güncelleme, durum değiştirme ve favori durumunu yönetir', async () => {
    const word = await savedWordsRepository.addWord({
      word: 'plausible',
      meaning: 'mantıklı, makul',
      synonyms: ['reasonable', 'credible'],
    });

    expect(word.status).toBe('learning');
    expect(word.isFavorite).toBe(false);

    // Durumu değiştir (Öğrenildi yap)
    const toggledStatus = await savedWordsRepository.toggleStatus(word.id);
    expect(toggledStatus.status).toBe('mastered');

    // Tekrar değiştir (Öğreniliyor yap)
    const toggledBack = await savedWordsRepository.toggleStatus(word.id);
    expect(toggledBack.status).toBe('learning');

    // Favori yap
    const favorited = await savedWordsRepository.toggleFavorite(word.id);
    expect(favorited.isFavorite).toBe(true);

    // Kelimeyi güncelle
    const updated = await savedWordsRepository.updateWord(word.id, {
      meaning: 'akla yatkın, inandırıcı',
      synonyms: ['reasonable', 'credible', 'believable'],
    });
    expect(updated.meaning).toBe('akla yatkın, inandırıcı');
    expect(updated.synonyms).toContain('believable');

    // Sil
    await savedWordsRepository.deleteWord(word.id);
    const deleted = await savedWordsRepository.getById(word.id);
    expect(deleted).toBeUndefined();
  });

  it('örnek YDS kelimelerini yükler (loadSampleWords)', async () => {
    const samples = await savedWordsRepository.loadSampleWords();
    expect(samples.length).toBeGreaterThan(0);

    const all = await savedWordsRepository.getAll();
    expect(all.length).toBe(samples.length);

    // İkinci kez çağrıldığında mükerrer kayıt oluşturmaz
    const secondCall = await savedWordsRepository.loadSampleWords();
    expect(secondCall.length).toBe(0);
    expect((await savedWordsRepository.getAll()).length).toBe(samples.length);
  });
});
