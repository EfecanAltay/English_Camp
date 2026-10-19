import React, { useState } from 'react';
import {
  Volume2,
  Star,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Trash2,
  Sparkles,
  ExternalLink,
  Video,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import type { SavedWord, WordPartOfSpeech } from '../../../core/domain/types';

export interface WordCardProps {
  word: SavedWord;
  onEdit: (word: SavedWord) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSeekToVideo?: (seconds: number) => void;
  compact?: boolean;
}

const PART_OF_SPEECH_LABELS: Record<WordPartOfSpeech, { label: string; color: string }> = {
  adjective: { label: 'Sıfat (adj)', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  verb: { label: 'Fiil (v)', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  noun: { label: 'İsim (n)', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  adverb: { label: 'Zarf (adv)', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  phrasal_verb: { label: 'Phrasal Verb', color: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30' },
  conjunction: { label: 'Bağlaç (conj)', color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' },
  preposition: { label: 'Edat (prep)', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
  phrase: { label: 'Kalıp / Deyim', color: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30' },
  other: { label: 'Kelime', color: 'bg-muted text-muted-foreground border-border' },
};

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFavorite,
  onSeekToVideo,
  compact = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const isMastered = word.status === 'mastered';

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const posConfig = word.partOfSpeech
    ? PART_OF_SPEECH_LABELS[word.partOfSpeech] || PART_OF_SPEECH_LABELS.other
    : PART_OF_SPEECH_LABELS.other;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 bg-card hover:shadow-md flex flex-col justify-between ${
        isMastered
          ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
          : 'border-border/80 hover:border-primary/50'
      } ${compact ? 'p-3.5' : 'p-5'}`}
    >
      <div className="space-y-3">
        {/* Top Header: Word + POS + Action Icons */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {word.word}
              </span>

              {/* Telaffuz Butonu */}
              <button
                type="button"
                onClick={() => handleSpeak(word.word)}
                title="Telaffuzu Dinle (Speech)"
                className={`p-1 rounded-md transition-colors ${
                  isPlayingAudio
                    ? 'text-primary bg-primary/20 animate-pulse'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted'
                }`}
              >
                <Volume2 className="h-4 w-4" />
              </button>

              {/* Kelime Türü */}
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold py-0.5 px-2 border ${posConfig.color}`}
              >
                {posConfig.label}
              </Badge>
            </div>

            {/* Türkçe Anlamı */}
            <div className="text-sm font-semibold text-foreground/90">
              {word.meaning}
            </div>
          </div>

          {/* Quick Actions (Favori, Edit, Delete) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(word.id)}
              className="p-1 rounded-lg text-muted-foreground hover:text-amber-500 transition-colors"
              title={word.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Star
                className={`h-4 w-4 ${
                  word.isFavorite ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => onEdit(word)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Düzenle"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(word.id)}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
              title="Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Eş Anlamlılar Bölümü (Synonyms) */}
        {word.synonyms && word.synonyms.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Eş Anlamlıları (Synonyms):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {word.synonyms.map((syn, idx) => (
                <span
                  key={idx}
                  onClick={() => handleSpeak(syn)}
                  title="Telaffuz için tıkla"
                  className="cursor-pointer text-xs font-medium px-2 py-0.5 rounded-md bg-muted/80 text-foreground hover:bg-primary/15 hover:text-primary border border-border/60 transition-colors"
                >
                  {syn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Zıt Anlamlılar Bölümü (Antonyms) */}
        {!compact && word.antonyms && word.antonyms.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              <span>Zıt Anlamlıları: </span>
              <span className="font-normal text-muted-foreground">
                {word.antonyms.join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Örnek Cümle */}
        {!compact && word.exampleSentence && (
          <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 text-xs space-y-1">
            <div className="italic text-foreground/90 font-medium">
              "{word.exampleSentence}"
            </div>
            {word.exampleTranslation && (
              <div className="text-[11px] text-muted-foreground">
                {word.exampleTranslation}
              </div>
            )}
          </div>
        )}

        {/* Notlar */}
        {!compact && word.notes && (
          <div className="text-[11px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
            <span className="font-semibold text-amber-700 dark:text-amber-400">Not: </span>
            <span>{word.notes}</span>
          </div>
        )}
      </div>

      {/* Card Footer: Kaynak & Durum */}
      <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-3 text-xs">
        {/* Kaynak Bilgisi veya Video Konumu */}
        <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[65%]">
          {word.sourceLessonTitle ? (
            word.sourceLessonId ? (
              <Link
                to={`/grammar/${word.sourceLessonId}`}
                className="inline-flex items-center gap-1 text-[11px] hover:text-primary hover:underline truncate"
                title={`${word.sourceLessonTitle} konusuna git`}
              >
                <Video className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{word.sourceLessonTitle}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] truncate">
                <BookOpen className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{word.sourceLessonTitle}</span>
              </span>
            )
          ) : (
            <span className="text-[10px] text-muted-foreground/80">Manuel Eklendi</span>
          )}

          {word.videoTimestampSeconds !== undefined && (
            <button
              type="button"
              onClick={() => onSeekToVideo?.(word.videoTimestampSeconds!)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold hover:bg-primary/20 shrink-0"
              title="Videoda bu ana git"
            >
              <span>{formatSeconds(word.videoTimestampSeconds)}</span>
            </button>
          )}
        </div>

        {/* Status Toggle Button */}
        <Button
          type="button"
          size="sm"
          variant={isMastered ? 'success' : 'outline'}
          onClick={() => onToggleStatus(word.id)}
          className={`h-7 px-2.5 text-[11px] font-bold gap-1 rounded-lg ${
            isMastered
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
          title={isMastered ? 'Tekrar Öğreniliyor Durumuna Al' : 'Öğrenildi Olarak İşaretle'}
        >
          {isMastered ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Öğrenildi</span>
            </>
          ) : (
            <>
              <RotateCcw className="h-3 w-3" />
              <span>Öğreniliyor</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
