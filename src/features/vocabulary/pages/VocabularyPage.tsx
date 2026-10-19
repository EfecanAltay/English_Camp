import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Star,
  Layers,
  LayoutGrid,
  List,
  BookMarked,
  ArrowUpDown,
  Volume2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { useSavedWords } from '../../../hooks/useSavedWords';
import { WordCard } from '../components/WordCard';
import { WordModal } from '../components/WordModal';
import { FlashcardStudyModal } from '../components/FlashcardStudyModal';
import type { SavedWord } from '../../../core/domain/types';
import type { CreateWordInput } from '../../../core/database/repositories/saved-words.repository';

export const VocabularyPage: React.FC = () => {
  const {
    words,
    stats,
    addWord,
    updateWord,
    deleteWord,
    toggleStatus,
    toggleFavorite,
    loadSampleWords,
  } = useSavedWords();

  // Filtreler & Sıralama
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'mastered' | 'favorite'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'grammar' | 'manual'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modallar
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<SavedWord | null>(null);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

  // Filtrelenmiş ve Sıralanmış Kelimeler
  const filteredWords = useMemo<SavedWord[]>(() => {
    let list: SavedWord[] = [...(words as SavedWord[])];

    // Arama filtrelemesi (Kelime, Anlam veya Eş Anlamlılarda ara)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((w: SavedWord) => {
        const inWord = w.word.toLowerCase().includes(q);
        const inMeaning = w.meaning.toLowerCase().includes(q);
        const inSynonyms = (w.synonyms || []).some((syn: string) => syn.toLowerCase().includes(q));
        const inNotes = (w.notes || '').toLowerCase().includes(q);
        return inWord || inMeaning || inSynonyms || inNotes;
      });
    }

    // Durum filtrelemesi
    if (statusFilter === 'learning') {
      list = list.filter((w) => w.status === 'learning');
    } else if (statusFilter === 'mastered') {
      list = list.filter((w) => w.status === 'mastered');
    } else if (statusFilter === 'favorite') {
      list = list.filter((w) => w.isFavorite);
    }

    // Kaynak filtrelemesi
    if (sourceFilter === 'grammar') {
      list = list.filter((w) => w.sourceType === 'grammar');
    } else if (sourceFilter === 'manual') {
      list = list.filter((w) => w.sourceType === 'manual');
    }

    // Sıralama
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'az') {
        return a.word.localeCompare(b.word);
      }
      if (sortBy === 'za') {
        return b.word.localeCompare(a.word);
      }
      return 0;
    });

    return list;
  }, [words, searchTerm, statusFilter, sourceFilter, sortBy]);

  const handleOpenAddModal = () => {
    setEditingWord(null);
    setIsWordModalOpen(true);
  };

  const handleOpenEditModal = (word: SavedWord) => {
    setEditingWord(word);
    setIsWordModalOpen(true);
  };

  const handleSaveWord = async (wordData: CreateWordInput, id?: string) => {
    if (id) {
      await updateWord(id, wordData);
    } else {
      await addWord(wordData);
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (window.confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) {
      await deleteWord(id);
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // yoksay
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <BookMarked className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Kelime Defteri & Bilinmeyen Kelimeler
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Video dersleri izlerken ve okuma yaparken not aldığınız tüm kelimeler, eş anlamlıları ve sınav çeldiricileriyle burada toplanır.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {words.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStudyModalOpen(true)}
                className="h-9 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
              >
                <Layers className="h-4 w-4" />
                <span>Kartlarla Tekrar Et ({words.length})</span>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAddModal}
              className="h-9 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Kelime Ekle</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/70 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Toplam Kelime
              </div>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {stats.total}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Öğreniliyor
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {stats.learning}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Öğrenildi
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.mastered}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Eş Anlamlı Havuzu
              </div>
              <div className="text-2xl font-black text-primary mt-0.5">
                {stats.totalSynonyms}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kelime, Türkçe anlam veya eş anlamlı ara (örn: reluctant, isteksiz)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Temizle
              </button>
            )}
          </div>

          {/* Sort & View Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 border border-border rounded-xl px-2.5 py-1.5 bg-background text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none text-xs text-foreground font-medium cursor-pointer"
              >
                <option value="newest">En Yeni Eklenenler</option>
                <option value="oldest">En Eski Eklenenler</option>
                <option value="az">A'dan Z'ye</option>
                <option value="za">Z'den A'ya</option>
              </select>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center border border-border rounded-xl p-0.5 bg-background">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Liste Görünümü"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs & Source Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Tümü ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('learning')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'learning'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Öğreniliyor ({stats.learning})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('mastered')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Öğrenildi ({stats.mastered})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('favorite')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                statusFilter === 'favorite'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Star className="h-3 w-3 fill-current" />
              <span>Favoriler ({stats.favorites})</span>
            </button>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="font-medium mr-1">Kaynak:</span>
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-2 py-0.5 rounded ${
                sourceFilter === 'all' ? 'bg-primary/15 text-primary font-bold' : 'hover:text-foreground'
              }`}
            >
              Tümü
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSourceFilter('grammar')}
              className={`px-2 py-0.5 rounded ${
                sourceFilter === 'grammar' ? 'bg-primary/15 text-primary font-bold' : 'hover:text-foreground'
              }`}
            >
              Gramer Videoları
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSourceFilter('manual')}
              className={`px-2 py-0.5 rounded ${
                sourceFilter === 'manual' ? 'bg-primary/15 text-primary font-bold' : 'hover:text-foreground'
              }`}
            >
              Manuel
            </button>
          </div>
        </div>
      </div>

      {/* Words Grid / List Content */}
      {filteredWords.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteWord}
                onToggleStatus={toggleStatus}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Table / List View */
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Kelime</th>
                    <th className="py-3 px-4 font-bold">Türkçe Anlamı</th>
                    <th className="py-3 px-4 font-bold">Eş Anlamlıları (Synonyms)</th>
                    <th className="py-3 px-4 font-bold">Kaynak</th>
                    <th className="py-3 px-4 font-bold text-center">Durum</th>
                    <th className="py-3 px-4 font-bold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredWords.map((word) => {
                    const isMastered = word.status === 'mastered';
                    return (
                      <tr
                        key={word.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="py-3 px-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleFavorite(word.id)}
                              className="text-muted-foreground hover:text-amber-500"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  word.isFavorite ? 'fill-amber-500 text-amber-500' : ''
                                }`}
                              />
                            </button>
                            <span>{word.word}</span>
                            <button
                              type="button"
                              onClick={() => handleSpeak(word.word)}
                              className="text-muted-foreground hover:text-primary"
                              title="Telaffuz"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground/90 font-medium">
                          {word.meaning}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {word.synonyms && word.synonyms.length > 0 ? (
                              word.synonyms.map((syn: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                                >
                                  {syn}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground/50">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-[11px]">
                          {word.sourceLessonTitle || 'Manuel'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant={isMastered ? 'success' : 'outline'}
                            onClick={() => toggleStatus(word.id)}
                            className={`h-6 px-2 text-[10px] font-bold gap-1 rounded-md ${
                              isMastered
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {isMastered ? 'Öğrenildi' : 'Öğreniliyor'}
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(word)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <span className="sr-only">Düzenle</span>
                              <Sparkles className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWord(word.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <span className="sr-only">Sil</span>
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : words.length === 0 ? (
        /* Henüz Hiç Kelime Yokken Empty State */
        <div className="rounded-3xl border-2 border-dashed border-border p-10 sm:p-14 text-center space-y-4 bg-card/50">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookMarked className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">
              Henüz Kayıtlı Bilinmeyen Kelimeniz Yok
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Gramer video derslerini izlerken bilmediğiniz kelimelerle karşılaştığınızda video ekranından veya buradan tek tıkla not alabilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAddModal}
              className="gap-2 text-xs font-bold h-10 px-4"
            >
              <Plus className="h-4 w-4" />
              <span>İlk Kelimeni Ekle</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await loadSampleWords();
              }}
              className="gap-2 text-xs font-semibold h-10 px-4 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-4 w-4" />
              <span>5 Örnek YDS Kelimesi Yükle</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Filtreleme Sonucu 0 Kelime */
        <div className="rounded-2xl border border-border p-8 text-center space-y-3 bg-card">
          <Search className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
          <div className="text-sm font-semibold text-foreground">
            Arama kriterlerine uygun kelime bulunamadı
          </div>
          <p className="text-xs text-muted-foreground">
            Arama terimini değiştirebilir veya filtreleri sıfırlayabilirsiniz.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSourceFilter('all');
            }}
            className="text-xs h-8"
          >
            Filtreleri Sıfırla
          </Button>
        </div>
      )}

      {/* Add / Edit Word Modal */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => {
          setIsWordModalOpen(false);
          setEditingWord(null);
        }}
        onSave={handleSaveWord}
        initialWord={editingWord}
      />

      {/* Flashcard Review Modal */}
      <FlashcardStudyModal
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        words={filteredWords.length > 0 ? filteredWords : words}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
};
