import { describe, it, expect } from 'vitest';
import {
  GRAMMAR_LESSONS,
  getGrammarLessonById,
  formatSecondsToTime,
  findActiveSectionIndex,
} from './grammar-lessons.data';

describe('Grammar Lessons & YouTube Integration', () => {
  it('Grammar dersleri başarıyla tanımlanmış olmalıdır', () => {
    expect(GRAMMAR_LESSONS.length).toBeGreaterThanOrEqual(3);
  });

  it('1. Ders YouTube linkindeki ce2zVJur69o videosunu ve Tenses Part 1 içeriğini içermelidir', () => {
    const lesson1 = getGrammarLessonById('grammar-video-ce2zVJur69o') || GRAMMAR_LESSONS.find(l => l.videoId === 'ce2zVJur69o');
    expect(lesson1).toBeDefined();
    expect(lesson1?.videoId).toBe('ce2zVJur69o');
    expect(lesson1?.playlistId).toBe('PLZ8NNzfwIohAWvt5rRPjFcv9rfk8jRjpS');
    expect(lesson1?.title).toContain('Tenses Part 1');
    expect(lesson1?.instructor).toContain('Dilci Burak Hoca');
  });

  it('Tüm gramer dersleri bölümler (sections) içermeli ve en az bir formül/açıklama barındırmalıdır', () => {
    for (const lesson of GRAMMAR_LESSONS) {
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.examTactics.length).toBeGreaterThan(0);
      const hasFormulasOrDescription = lesson.sections.some((s) => !!s.formula || !!s.description);
      expect(hasFormulasOrDescription).toBe(true);
    }
  });

  it('Tüm bölümler geçerli timeRange, startSeconds ve endSeconds değerlerine sahip olmalıdır', () => {
    let totalSections = 0;
    for (const lesson of GRAMMAR_LESSONS) {
      for (const section of lesson.sections) {
        totalSections++;
        expect(section.timeRange).toBeDefined();
        expect(typeof section.timeRange).toBe('string');
        expect(section.timeRange?.includes('-')).toBe(true);
        expect(section.startSeconds).toBeDefined();
        expect(typeof section.startSeconds).toBe('number');
        expect(section.startSeconds).toBeGreaterThanOrEqual(0);
        if (section.endSeconds !== undefined) {
          expect(section.endSeconds).toBeGreaterThanOrEqual(section.startSeconds!);
        }
      }
    }
    expect(totalSections).toBe(87);
  });

  it('formatSecondsToTime ve findActiveSectionIndex zaman fonksiyonları doğru çalışmalıdır', () => {
    expect(formatSecondsToTime(0)).toBe('00:00');
    expect(formatSecondsToTime(66)).toBe('01:06');
    expect(formatSecondsToTime(113)).toBe('01:53');
    expect(formatSecondsToTime(1320)).toBe('22:00');

    const sampleSections = [
      {
        title: 'Giriş',
        timeRange: '00:00 - 01:52',
        startSeconds: 0,
        endSeconds: 112,
        description: 'Giriş bölümü',
      },
      {
        title: 'Öncelik Piramidi',
        timeRange: '01:53 - 06:20',
        startSeconds: 113,
        endSeconds: 380,
        description: 'Piramit',
      },
      {
        title: 'Kelime Tekrarı',
        timeRange: '06:21 - 13:08',
        startSeconds: 381,
        endSeconds: 788,
        description: 'Kelime',
      },
    ];

    expect(findActiveSectionIndex(sampleSections, 50)).toBe(0);
    expect(findActiveSectionIndex(sampleSections, 113)).toBe(1);
    expect(findActiveSectionIndex(sampleSections, 250)).toBe(1);
    expect(findActiveSectionIndex(sampleSections, 381)).toBe(2);
    expect(findActiveSectionIndex(sampleSections, 788)).toBe(2);
    expect(findActiveSectionIndex(sampleSections, 9999)).toBe(-1);
  });

  it('Quiz sorularının doğru cevapları seçenekler arasında bulunmalı ve açıklamaları olmalıdır', () => {
    for (const lesson of GRAMMAR_LESSONS) {
      for (const q of lesson.quiz) {
        const optionLabels = q.options.map((o) => o.label);
        expect(optionLabels).toContain(q.correctAnswer);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });
});
