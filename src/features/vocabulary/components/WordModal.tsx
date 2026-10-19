import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  BookMarked,
  Sparkles,
  Clock,
  Video,
  FileText,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { SavedWord, WordPartOfSpeech } from '../../../core/domain/types';
import type { CreateWordInput } from '../../../core/database/repositories/saved-words.repository';

export interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wordData: CreateWordInput, id?: string) => Promise<void>;
  initialWord?: SavedWord | null;
  defaultLessonId?: string;
  defaultLessonTitle?: string;
  defaultVideoTimestamp?: number;
}

const PART_OF_SPEECH_OPTIONS: { label: string; value: WordPartOfSpeech }[] = [
  { label: 'Sıfat (adj)', value: 'adjective' },
  { label: 'Fiil (verb)', value: 'verb' },
  { label: 'İsim (noun)', value: 'noun' },
  { label: 'Zarf (adv)', value: 'adverb' },
  { label: 'Phrasal Verb', value: 'phrasal_verb' },
  { label: 'Bağlaç (conj)', value: 'conjunction' },
  { label: 'Edat (prep)', value: 'preposition' },
  { label: 'Kalıp / Deyim', value: 'phrase' },
  { label: 'Diğer', value: 'other' },
];

function formatSecondsToTimestamp(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWord,
  defaultLessonId,
  defaultLessonTitle,
  defaultVideoTimestamp,
}) => {
  const isEditing = Boolean(initialWord);

  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [synonymInput, setSynonymInput] = useState('');
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonymInput, setAntonymInput] = useState('');
  const [antonyms, setAntonyms] = useState<string[]>([]);
  const [partOfSpeech, setPartOfSpeech] = useState<WordPartOfSpeech>('other');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal her açıldığında veya initialWord değiştiğinde formu doldur
  useEffect(() => {
    if (isOpen) {
      if (initialWord) {
        setWord(initialWord.word);
        setMeaning(initialWord.meaning);
        setSynonyms(initialWord.synonyms || []);
        setAntonyms(initialWord.antonyms || []);
        setPartOfSpeech(initialWord.partOfSpeech || 'other');
        setExampleSentence(initialWord.exampleSentence || '');
        setExampleTranslation(initialWord.exampleTranslation || '');
        setNotes(initialWord.notes || '');
        setIsFavorite(initialWord.isFavorite || false);
        setIncludeTimestamp(initialWord.videoTimestampSeconds !== undefined);
        setShowAdvanced(
          Boolean(
            initialWord.antonyms?.length ||
              initialWord.exampleSentence ||
              initialWord.notes
          )
        );
      } else {
        // Yeni Kelime Formu
        setWord('');
        setMeaning('');
        setSynonymInput('');
        setSynonyms([]);
        setAntonymInput('');
        setAntonyms([]);
        setPartOfSpeech('adjective');
        setExampleSentence('');
        setExampleTranslation('');
        setNotes('');
        setIsFavorite(false);
        setIncludeTimestamp(defaultVideoTimestamp !== undefined && defaultVideoTimestamp > 0);
        setShowAdvanced(false);
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialWord, defaultVideoTimestamp]);

  // Esc tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSynonym = () => {
    const trimmed = synonymInput.trim();
    if (!trimmed) return;

    // Virgülle ayrılmış birden fazla kelime yazılmış olabilir
    const newItems = trimmed
      .split(/[,;]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0 && !synonyms.includes(s));

    if (newItems.length > 0) {
      setSynonyms((prev) => [...prev, ...newItems]);
    }
    setSynonymInput('');
  };

  const handleRemoveSynonym = (indexToRemove: number) => {
    setSynonyms((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddAntonym = () => {
    const trimmed = antonymInput.trim();
    if (!trimmed) return;

    const newItems = trimmed
      .split(/[,;]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0 && !antonyms.includes(s));

    if (newItems.length > 0) {
      setAntonyms((prev) => [...prev, ...newItems]);
    }
    setAntonymInput('');
  };

  const handleRemoveAntonym = (indexToRemove: number) => {
    setAntonyms((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!word.trim()) {
      setError('Lütfen İngilizce kelimeyi giriniz.');
      return;
    }
    if (!meaning.trim()) {
      setError('Lütfen kelimenin Türkçe anlamını/çevirisini giriniz.');
      return;
    }

    // Inputta henüz eklenmemiş kelime varsa otomatik ekle
    let finalSynonyms = [...synonyms];
    if (synonymInput.trim()) {
      const extra = synonymInput
        .split(/[,;]/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0 && !finalSynonyms.includes(s));
      finalSynonyms = [...finalSynonyms, ...extra];
    }

    let finalAntonyms = [...antonyms];
    if (antonymInput.trim()) {
      const extra = antonymInput
        .split(/[,;]/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0 && !finalAntonyms.includes(s));
      finalAntonyms = [...finalAntonyms, ...extra];
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const timestamp =
        includeTimestamp && defaultVideoTimestamp !== undefined && defaultVideoTimestamp > 0
          ? Math.floor(defaultVideoTimestamp)
          : initialWord?.videoTimestampSeconds;

      const payload: CreateWordInput = {
        word: word.trim(),
        meaning: meaning.trim(),
        synonyms: finalSynonyms,
        antonyms: finalAntonyms.length > 0 ? finalAntonyms : undefined,
        partOfSpeech,
        exampleSentence: exampleSentence.trim() || undefined,
        exampleTranslation: exampleTranslation.trim() || undefined,
        sourceLessonId: initialWord?.sourceLessonId || defaultLessonId,
        sourceLessonTitle: initialWord?.sourceLessonTitle || defaultLessonTitle,
        sourceType: initialWord?.sourceType || (defaultLessonId ? 'grammar' : 'manual'),
        videoTimestampSeconds: timestamp,
        notes: notes.trim() || undefined,
        isFavorite,
        status: initialWord?.status || 'learning',
      };

      await onSave(payload, initialWord?.id);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Kelime kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl p-6 flex flex-col space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {isEditing ? 'Kelimeyi Düzenle' : 'Bilinmeyen Kelime Not Et'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {defaultLessonTitle
                  ? `${defaultLessonTitle} dersinden kelime notu alınıyor`
                  : 'YDS kelime defterinize yeni bir kelime ekleyin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite((prev) => !prev)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-muted transition-colors"
              title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Star
                className={`h-5 w-5 ${
                  isFavorite ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video & Source Info Banner */}
        {defaultLessonTitle && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground">Kaynak Ders: </span>
                <span className="text-muted-foreground">{defaultLessonTitle}</span>
              </div>
            </div>

            {defaultVideoTimestamp !== undefined && defaultVideoTimestamp > 0 && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-primary">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <Clock className="h-3.5 w-3.5" />
                <span>{formatSecondsToTimestamp(defaultVideoTimestamp)} konumunu bağla</span>
              </label>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kelime & Çeviri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Kelime (İngilizce) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Örn: reluctant, advocate, enhance"
                autoFocus
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Türkçe Anlamı / Çeviri <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Örn: isteksiz, tereddütlü"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Eş Anlamlı Kelimeler (Synonyms) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Eş Anlamlıları (Synonyms)</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Virgülle ayırarak veya Enter'a basarak ekleyin
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={synonymInput}
                onChange={(e) => setSynonymInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddSynonym();
                  }
                }}
                placeholder="Örn: unwilling, hesitant, disinclined..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSynonym}
                className="text-xs h-9 px-3 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ekle</span>
              </Button>
            </div>

            {/* Eklenen Eş Anlamlı Rozetleri */}
            {synonyms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {synonyms.map((syn, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-medium py-1 px-2.5 rounded-lg gap-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
                  >
                    <span>{syn}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSynonym(idx)}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sözcük Türü Seçici */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground">
              Sözcük Türü (Part of Speech)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PART_OF_SPEECH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPartOfSpeech(opt.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    partOfSpeech === opt.value
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                      : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detay Alanları Aç/Kapa Butonu */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>
                {showAdvanced
                  ? 'Daha Az Detay Göster'
                  : '+ Örnek Cümle, Zıt Anlamlılar ve Not Ekle'}
              </span>
            </button>
          </div>

          {/* İleri Düzey Alanlar (Örnek Cümle, Zıt Anlam, Notlar) */}
          {showAdvanced && (
            <div className="space-y-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/60 animate-in fade-in duration-200">
              {/* Zıt Anlamlılar (Antonyms) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Zıt Anlamlıları (Antonyms)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={antonymInput}
                    onChange={(e) => setAntonymInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddAntonym();
                      }
                    }}
                    placeholder="Örn: willing, eager, keen..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAntonym}
                    className="text-xs h-8 px-2.5"
                  >
                    Ekle
                  </Button>
                </div>
                {antonyms.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {antonyms.map((ant, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[11px] py-0.5 px-2 gap-1 border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                      >
                        <span>{ant}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAntonym(idx)}
                          className="hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Örnek Cümle */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Örnek Cümle (İngilizce)
                </label>
                <input
                  type="text"
                  value={exampleSentence}
                  onChange={(e) => setExampleSentence(e.target.value)}
                  placeholder="Örn: She was reluctant to share the confidential report."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Örnek Cümle Çevirisi */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Örnek Cümle Türkçe Çevirisi
                </label>
                <input
                  type="text"
                  value={exampleTranslation}
                  onChange={(e) => setExampleTranslation(e.target.value)}
                  placeholder="Örn: Gizli raporu paylaşmaya isteksizdi."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Kişisel Notlar */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Kişisel Hatırlatıcı Not / İpuçları
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Sınav ipucu, prepositions (örn: reluctant to + V1), hafıza tekniği..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <div className="text-[11px] text-muted-foreground">
              <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">
                Esc
              </kbd>{' '}
              ile kapat
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs h-9"
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isSubmitting}
                className="text-xs h-9 font-bold px-4 gap-1.5 shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
