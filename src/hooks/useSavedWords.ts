import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/database/app.database';
import {
  savedWordsRepository,
  type CreateWordInput,
} from '../core/database/repositories/saved-words.repository';
import type { SavedWord } from '../core/domain/types';
import { useMemo } from 'react';

export function useSavedWords() {
  const rawWords = useLiveQuery<SavedWord[]>(
    () => db.savedWords.reverse().sortBy('createdAt'),
    []
  );
  const words: SavedWord[] = rawWords || [];

  const stats = useMemo(() => {
    const total = words.length;
    const learning = words.filter((w) => w.status === 'learning').length;
    const mastered = words.filter((w) => w.status === 'mastered').length;
    const favorites = words.filter((w) => w.isFavorite).length;

    const allSynonymsSet = new Set<string>();
    words.forEach((w) => {
      (w.synonyms || []).forEach((syn) => allSynonymsSet.add(syn.toLowerCase()));
    });

    return {
      total,
      learning,
      mastered,
      favorites,
      totalSynonyms: allSynonymsSet.size,
    };
  }, [words]);

  const addWord = async (input: CreateWordInput): Promise<SavedWord> => {
    return await savedWordsRepository.addWord(input);
  };

  const updateWord = async (
    id: string,
    updates: Partial<Omit<SavedWord, 'id' | 'createdAt'>>
  ): Promise<SavedWord> => {
    return await savedWordsRepository.updateWord(id, updates);
  };

  const deleteWord = async (id: string): Promise<void> => {
    await savedWordsRepository.deleteWord(id);
  };

  const toggleStatus = async (id: string): Promise<SavedWord> => {
    return await savedWordsRepository.toggleStatus(id);
  };

  const toggleFavorite = async (id: string): Promise<SavedWord> => {
    return await savedWordsRepository.toggleFavorite(id);
  };

  const loadSampleWords = async (): Promise<SavedWord[]> => {
    return await savedWordsRepository.loadSampleWords();
  };

  const clearAllWords = async (): Promise<void> => {
    await savedWordsRepository.clearAll();
  };

  return {
    words,
    isLoading: rawWords === undefined,
    stats,
    addWord,
    updateWord,
    deleteWord,
    toggleStatus,
    toggleFavorite,
    loadSampleWords,
    clearAllWords,
  };
}
