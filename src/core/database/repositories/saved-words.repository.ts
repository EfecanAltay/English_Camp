import { db } from '../app.database';
import type { SavedWord, WordPartOfSpeech } from '../../domain/types';

export interface CreateWordInput {
  word: string;
  meaning: string;
  synonyms?: string[];
  antonyms?: string[];
  partOfSpeech?: WordPartOfSpeech;
  exampleSentence?: string;
  exampleTranslation?: string;
  sourceLessonId?: string;
  sourceLessonTitle?: string;
  sourceType?: 'grammar' | 'reading' | 'vocabulary' | 'manual';
  videoTimestampSeconds?: number;
  notes?: string;
  status?: 'learning' | 'mastered';
  isFavorite?: boolean;
}

export const SAMPLE_YDS_WORDS: CreateWordInput[] = [
  {
    word: 'reluctant',
    meaning: 'isteksiz, gönülsüz, tereddütlü',
    synonyms: ['unwilling', 'hesitant', 'disinclined', 'averse'],
    antonyms: ['willing', 'eager', 'keen'],
    partOfSpeech: 'adjective',
    exampleSentence: 'Many students are reluctant to speak English without complete confidence.',
    exampleTranslation: 'Birçok öğrenci tam güven hissetmeden İngilizce konuşmaya isteksizdir.',
    sourceType: 'manual',
    notes: 'YDS/YÖKDİL sınavlarında sıkça çeldirici sıfat olarak sorulur.',
    status: 'learning',
    isFavorite: true,
  },
  {
    word: 'advocate',
    meaning: 'savunmak, desteklemek; savunucu',
    synonyms: ['support', 'champion', 'uphold', 'endorse'],
    antonyms: ['oppose', 'condemn'],
    partOfSpeech: 'verb',
    exampleSentence: 'Environmentalists advocate stricter measures against deforestation.',
    exampleTranslation: 'Çevreciler ormansızlaşmaya karşı daha katı tedbirleri savunmaktadır.',
    sourceType: 'manual',
    notes: 'Hem fiil hem isim olarak kullanılabilir.',
    status: 'learning',
    isFavorite: false,
  },
  {
    word: 'enhance',
    meaning: 'artırmak, geliştirmek, yükseltmek',
    synonyms: ['improve', 'boost', 'augment', 'enrich'],
    antonyms: ['diminish', 'impair', 'reduce'],
    partOfSpeech: 'verb',
    exampleSentence: 'Regular spaced repetition enhances vocabulary retention significantly.',
    exampleTranslation: 'Düzenli aralıklı tekrar kelime akılda kalıcılığını önemli ölçüde artırır.',
    sourceType: 'manual',
    status: 'learning',
    isFavorite: true,
  },
  {
    word: 'vulnerable',
    meaning: 'savunmasız, hassas, kolay incinir',
    synonyms: ['susceptible', 'defenseless', 'exposed', 'fragile'],
    antonyms: ['invulnerable', 'resilient', 'protected'],
    partOfSpeech: 'adjective',
    exampleSentence: 'Children and the elderly are particularly vulnerable to viral infections.',
    exampleTranslation: 'Çocuklar ve yaşlılar viral enfeksiyonlara karşı özellikle savunmasızdır.',
    sourceType: 'manual',
    notes: 'Genellikle "vulnerable to..." kalıbıyla kullanılır.',
    status: 'learning',
    isFavorite: false,
  },
  {
    word: 'comply with',
    meaning: '-e uymak, riayet etmek, gereğini yerine getirmek',
    synonyms: ['obey', 'conform to', 'abide by', 'adhere to'],
    antonyms: ['violate', 'defy', 'breach'],
    partOfSpeech: 'phrasal_verb',
    exampleSentence: 'All institutions must strictly comply with international regulations.',
    exampleTranslation: 'Tüm kurumlar uluslararası düzenlemelere sıkı bir şekilde uymak zorundadır.',
    sourceType: 'manual',
    notes: 'YDS Preposition ve Phrasal Verb sorularının vazgeçilmezidir (comply WITH).',
    status: 'learning',
    isFavorite: true,
  },
];

export const savedWordsRepository = {
  async getAll(): Promise<SavedWord[]> {
    return await db.savedWords.reverse().sortBy('createdAt');
  },

  async getById(id: string): Promise<SavedWord | undefined> {
    return await db.savedWords.get(id);
  },

  async getByLessonId(lessonId: string): Promise<SavedWord[]> {
    return await db.savedWords.where('sourceLessonId').equals(lessonId).toArray();
  },

  async addWord(input: CreateWordInput): Promise<SavedWord> {
    const now = new Date().toISOString();
    const id = `word-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Normalize synonyms: trim, filter empty, deduplicate
    const cleanSynonyms = (input.synonyms || [])
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanAntonyms = (input.antonyms || [])
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newWord: SavedWord = {
      id,
      word: input.word.trim(),
      meaning: input.meaning.trim(),
      synonyms: Array.from(new Set(cleanSynonyms)),
      antonyms: cleanAntonyms.length > 0 ? Array.from(new Set(cleanAntonyms)) : undefined,
      partOfSpeech: input.partOfSpeech || 'other',
      exampleSentence: input.exampleSentence?.trim() || undefined,
      exampleTranslation: input.exampleTranslation?.trim() || undefined,
      sourceLessonId: input.sourceLessonId,
      sourceLessonTitle: input.sourceLessonTitle,
      sourceType: input.sourceType || 'manual',
      videoTimestampSeconds: input.videoTimestampSeconds,
      notes: input.notes?.trim() || undefined,
      status: input.status || 'learning',
      isFavorite: input.isFavorite ?? false,
      createdAt: now,
      updatedAt: now,
    };

    await db.savedWords.put(newWord);
    return newWord;
  },

  async updateWord(id: string, updates: Partial<Omit<SavedWord, 'id' | 'createdAt'>>): Promise<SavedWord> {
    const existing = await db.savedWords.get(id);
    if (!existing) {
      throw new Error(`Word not found with id: ${id}`);
    }

    const now = new Date().toISOString();
    const cleanSynonyms = updates.synonyms !== undefined
      ? Array.from(new Set(updates.synonyms.map((s) => s.trim()).filter((s) => s.length > 0)))
      : existing.synonyms;

    const cleanAntonyms = updates.antonyms !== undefined
      ? Array.from(new Set(updates.antonyms.map((s) => s.trim()).filter((s) => s.length > 0)))
      : existing.antonyms;

    const updated: SavedWord = {
      ...existing,
      ...updates,
      word: updates.word !== undefined ? updates.word.trim() : existing.word,
      meaning: updates.meaning !== undefined ? updates.meaning.trim() : existing.meaning,
      synonyms: cleanSynonyms,
      antonyms: cleanAntonyms,
      updatedAt: now,
    };

    await db.savedWords.put(updated);
    return updated;
  },

  async deleteWord(id: string): Promise<void> {
    await db.savedWords.delete(id);
  },

  async toggleStatus(id: string): Promise<SavedWord> {
    const existing = await db.savedWords.get(id);
    if (!existing) {
      throw new Error(`Word not found with id: ${id}`);
    }
    const newStatus = existing.status === 'learning' ? 'mastered' : 'learning';
    return this.updateWord(id, { status: newStatus });
  },

  async toggleFavorite(id: string): Promise<SavedWord> {
    const existing = await db.savedWords.get(id);
    if (!existing) {
      throw new Error(`Word not found with id: ${id}`);
    }
    return this.updateWord(id, { isFavorite: !existing.isFavorite });
  },

  async loadSampleWords(): Promise<SavedWord[]> {
    const results: SavedWord[] = [];
    for (const sample of SAMPLE_YDS_WORDS) {
      // Check if word already exists
      const existing = await db.savedWords
        .filter((w) => w.word.toLowerCase() === sample.word.toLowerCase())
        .first();
      if (!existing) {
        const added = await this.addWord(sample);
        results.push(added);
      }
    }
    return results;
  },

  async clearAll(): Promise<void> {
    await db.savedWords.clear();
  },
};
