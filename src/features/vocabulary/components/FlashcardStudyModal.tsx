import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Shuffle,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { SavedWord } from '../../../core/domain/types';

export interface FlashcardStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: SavedWord[];
  onToggleStatus: (id: string) => Promise<SavedWord | void>;
}

export const FlashcardStudyModal: React.FC<FlashcardStudyModalProps> = ({
  isOpen,
  onClose,
  words,
  onToggleStatus,
}) => {
  const [deck, setDeck] = useState<SavedWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeck([...words]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen, words]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, deck.length]);

  if (!isOpen || deck.length === 0) return null;

  const currentWord = deck[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : deck.length - 1));
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
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

  const handleMarkMastered = async () => {
    if (currentWord.status !== 'mastered') {
      await onToggleStatus(currentWord.id);
      // Yerel deckte de güncelle
      setDeck((prev) =>
        prev.map((w, idx) => (idx === currentIndex ? { ...w, status: 'mastered' } : w))
      );
    }
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl p-6 flex flex-col space-y-4 animate-in zoom-in-95 duration-200">
        {/* Top Controls */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
              Kart {currentIndex + 1} / {deck.length}
            </Badge>
            {currentWord.status === 'mastered' && (
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Öğrenildi</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              className="text-xs h-8 px-2.5 gap-1.5"
              title="Kartları Karıştır"
            >
              <Shuffle className="h-3.5 w-3.5 text-primary" />
              <span>Karıştır</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* The Flashcard Body */}
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className="cursor-pointer select-none min-h-[260px] sm:min-h-[290px] rounded-2xl border-2 border-border/80 bg-gradient-to-br from-card via-card to-muted/30 p-6 flex flex-col items-center justify-center text-center shadow-inner relative hover:border-primary/50 transition-all duration-300 group"
        >
          {/* Flip Hint */}
          <div className="absolute top-3 right-3 text-[10px] font-semibold text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
            <Eye className="h-3 w-3" />
            <span>{isFlipped ? 'Ön Yüzü Gör' : 'Çevirmek için tıkla (Boşluk)'}</span>
          </div>

          {!isFlipped ? (
            /* Ön Yüz: Sadece İngilizce Kelime + Sözcük Türü */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  {currentWord.word}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentWord.word);
                  }}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="Dinle"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              {currentWord.partOfSpeech && (
                <Badge variant="outline" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {currentWord.partOfSpeech}
                </Badge>
              )}

              <p className="text-xs text-muted-foreground max-w-xs mx-auto pt-2">
                Anlamını ve eş anlamlılarını hatırlamaya çalışın, ardından kartı çevirin.
              </p>
            </div>
          ) : (
            /* Arka Yüz: Anlamı + Eş Anlamlılar + Örnek Cümle */
            <div className="space-y-4 w-full animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                  Türkçe Anlamı
                </span>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {currentWord.meaning}
                </div>
              </div>

              {/* Eş Anlamlılar */}
              {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Eş Anlamlıları (Synonyms):</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {currentWord.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/15 text-primary border border-primary/25"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Örnek Cümle */}
              {currentWord.exampleSentence && (
                <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground italic border border-border/60 max-w-md mx-auto">
                  "{currentWord.exampleSentence}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions & Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="h-9 px-3 gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Önceki</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-9 px-3 text-xs gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Geç</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkMastered}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Biliyorum!</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-9 px-3 gap-1"
          >
            <span className="hidden sm:inline">Sonraki</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="text-center text-[10px] text-muted-foreground/80 pt-1">
          Klavye: <kbd className="font-mono bg-muted px-1 rounded border">Boşluk</kbd> Çevir •{' '}
          <kbd className="font-mono bg-muted px-1 rounded border">←</kbd>{' '}
          <kbd className="font-mono bg-muted px-1 rounded border">→</kbd> Kartlar arası geçiş
        </div>
      </div>
    </div>
  );
};
