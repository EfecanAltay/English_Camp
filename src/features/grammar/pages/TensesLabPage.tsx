import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookMarked,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
  PERIODS,
  ASPECTS,
  TENSES_DATA,
  ORDERED_TENSE_KEYS,
  type PeriodType,
  type AspectType,
  type TenseKey,
} from '../../../core/content/tenses-lab.data';
import { TensesTimeline } from '../components/TensesTimeline';
import { WordModal } from '../../vocabulary/components/WordModal';
import { useSavedWords } from '../../../hooks/useSavedWords';
import type { CreateWordInput } from '../../../core/database/repositories/saved-words.repository';

export const TensesLabPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('present');
  const [aspect, setAspect] = useState<AspectType>('simple');
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Kelime Not Alma Modalı Entegrasyonu
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const { addWord } = useSavedWords();

  const currentKey: TenseKey = `${period}-${aspect}`;
  const currentTense = TENSES_DATA[currentKey];
  const currentIndex = ORDERED_TENSE_KEYS.indexOf(currentKey);

  // Zaman veya yapı değiştiğinde quizi sıfırla
  useEffect(() => {
    setAnsweredIndex(null);
  }, [period, aspect]);

  // Klavye ok tuşları ile önceki / sonraki zamana geçiş
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStep(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStep(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handleStep = (direction: number) => {
    const total = ORDERED_TENSE_KEYS.length;
    const nextIdx = (currentIndex + direction + total) % total;
    const nextKey = ORDERED_TENSE_KEYS[nextIdx];
    const [p, a] = nextKey.split('-') as [PeriodType, AspectType];
    setPeriod(p);
    setAspect(a);
  };

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

  const handleSaveWord = async (wordData: CreateWordInput) => {
    await addWord(wordData);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/grammar"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Gramer Konularına Dön</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-bold">
            İnteraktif Laboratuvar
          </Badge>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="text-[11px] font-black tracking-widest text-indigo-300 uppercase">
            ENGLISH TENSES LAB · İNTERAKTİF DERS
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            İngilizce Zamanları <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300">
              Görerek Öğren.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            12 temel zaman yapısını aynı hareketli zaman çizgisinde karşılaştır. Animasyonu izle, cümlenin nasıl kurulduğunu kavra ve mini testlerle bilgini ölç.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200">
              <strong className="text-emerald-300 font-bold">3</strong> Zaman Ekseni
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200">
              <strong className="text-emerald-300 font-bold">4</strong> Anlatım Biçimi
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200">
              <strong className="text-emerald-300 font-bold">12</strong> Temel Yapı
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold">
              ✓ Türkçe Açıklamalı & Sınav Taktikli
            </span>
          </div>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border-[40px] border-white/5 pointer-events-none" />
      </div>

      {/* Instruction */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
        <span>
          Aşağıdan bir <strong>Zaman</strong> ve <strong>Yapı</strong> seçin. Çizgide eylemin ne zaman gerçekleştiğini ve ne kadar sürdüğünü hareketli olarak izleyin.
        </span>
      </div>

      {/* Main Grid: Selector Sidebar + Content Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Selector Panel (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-5 space-y-5">
              {/* 01 · ZAMAN (PERIOD) */}
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  01 · ZAMAN EKSENİ
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {PERIODS.map((p) => {
                    const isActive = period === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPeriod(p.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: p.dotColor }}
                          />
                          <span>{p.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                          {p.enLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 02 · YAPI (ASPECT) */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  02 · YAPI BİÇİMİ (ASPECT)
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {ASPECTS.map((a) => {
                    const isActive = aspect === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAspect(a.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30'
                            : 'bg-background border-border hover:bg-muted/50'
                        }`}
                      >
                        <div
                          className={`text-xs font-bold ${
                            isActive ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {a.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-medium line-clamp-1">
                          {a.subLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Memory Tip */}
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/70 text-xs text-muted-foreground space-y-1.5">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Hızlı Hatırlatma Rehberi</span>
                </div>
                <ul className="space-y-1 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-foreground">Simple:</strong> Ne olur / oldu?
                  </li>
                  <li>
                    <strong className="text-foreground">Continuous:</strong> O sırada ne oluyordu?
                  </li>
                  <li>
                    <strong className="text-foreground">Perfect:</strong> Hangi andan önce tamamlandı?
                  </li>
                  <li>
                    <strong className="text-foreground">Perfect Continuous:</strong> Ne kadar süredir devam ediyor?
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Content & Timeline & Quiz (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* Main Tense Info Card */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-5">
            {/* Topline: Chip & Counter */}
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider py-1 px-3 bg-primary/15 text-primary border border-primary/20">
                {period.toUpperCase()} · {aspect.replace('perfectContinuous', 'perfect continuous').toUpperCase()}
              </Badge>

              <span className="text-xs font-mono font-bold text-muted-foreground">
                {String(currentIndex + 1).padStart(2, '0')} / 12
              </span>
            </div>

            {/* Tense Headings */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {currentTense.title}
              </h2>
              <div className="text-sm sm:text-base font-bold text-primary">
                {currentTense.tr}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                {currentTense.description}
              </p>
            </div>

            {/* Animated Timeline */}
            <TensesTimeline
              period={period}
              aspect={aspect}
              note={currentTense.note}
            />

            {/* When to use & Formula Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* When */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  NE ZAMAN KULLANILIR?
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                  {currentTense.when}
                </p>
              </div>

              {/* Formulas */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  CÜMLE KALIBI
                </h3>
                <div className="space-y-1.5 font-mono text-[11px] sm:text-xs">
                  <div className="p-2 rounded-lg bg-background border border-border text-foreground">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1.5">+</span>
                    <span>{currentTense.positive}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border text-foreground">
                    <span className="font-bold text-rose-600 dark:text-rose-400 mr-1.5">−</span>
                    <span>{currentTense.negative}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border text-foreground">
                    <span className="font-bold text-primary mr-1.5">?</span>
                    <span>{currentTense.question}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Sentence Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Örnek Cümle & Çeviri
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(currentTense.example)}
                    className="h-7 px-2 text-xs gap-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                    title="Sesli Dinle"
                  >
                    <Volume2 className={`h-3.5 w-3.5 ${isPlayingAudio ? 'animate-pulse text-primary' : ''}`} />
                    <span>Dinle</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWordModalOpen(true)}
                    className="h-7 px-2 text-xs gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                    title="Bu cümleden kelime defterine not al"
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                    <span>Kelime Not Al</span>
                  </Button>
                </div>
              </div>

              <div className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                "{currentTense.example}"
              </div>

              <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                {currentTense.translation}
              </div>
            </div>

            {/* Signals and Tips */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 text-xs space-y-1.5 leading-relaxed">
              <div>
                <strong className="text-foreground">Sık Kullanılan Zaman Zarfları: </strong>
                <span className="text-muted-foreground font-mono">{currentTense.signals}</span>
              </div>
              <div>
                <strong className="text-primary font-bold">Sınav İpucu: </strong>
                <span className="text-muted-foreground">{currentTense.tip}</span>
              </div>
            </div>

            {/* Bottom Stepper Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStep(-1)}
                className="h-9 px-3 gap-1.5 text-xs font-semibold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Önceki Zaman</span>
              </Button>

              <div className="text-xs font-semibold text-muted-foreground text-center">
                <span className="hidden sm:inline">Klavye: </span>
                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">←</kbd>{' '}
                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">→</kbd>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => handleStep(1)}
                className="h-9 px-4 gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs"
              >
                <span>Sonraki Zaman</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mini Test / Quiz Section */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  03 · PEKİŞTİRME & MİNİ SORU
                </span>
              </div>

              <Badge variant="outline" className="text-[10px] font-semibold">
                Anında Geri Bildirim
              </Badge>
            </div>

            <div className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
              {currentTense.quiz.q}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentTense.quiz.a.map((option, idx) => {
                const isSelected = answeredIndex === idx;
                const isCorrect = idx === currentTense.quiz.correct;
                const hasAnswered = answeredIndex !== null;

                let buttonStyles =
                  'border-border bg-background hover:bg-muted/60 text-foreground hover:border-primary/40';

                if (hasAnswered) {
                  if (isCorrect) {
                    buttonStyles =
                      'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500';
                  } else if (isSelected) {
                    buttonStyles =
                      'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200 font-bold';
                  } else {
                    buttonStyles = 'border-border/60 opacity-60 bg-muted/20 text-muted-foreground';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAnsweredIndex(idx)}
                    className={`p-3.5 rounded-xl border text-xs text-left font-semibold transition-all ${buttonStyles}`}
                  >
                    <span className="font-mono text-muted-foreground mr-1.5">
                      {String.fromCharCode(65 + idx)})
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {answeredIndex !== null && (
              <div
                className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  answeredIndex === currentTense.quiz.correct
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                }`}
              >
                {answeredIndex === currentTense.quiz.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block mb-0.5">
                    {answeredIndex === currentTense.quiz.correct ? 'Harika! Doğru Cevap.' : 'Tekrar Düşün!'}
                  </strong>
                  <span>{currentTense.quiz.why}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kelime Not Alma Modalı */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        onSave={handleSaveWord}
        defaultLessonId={`tenses-lab-${currentKey}`}
        defaultLessonTitle={`Tenses Lab: ${currentTense.title}`}
      />
    </div>
  );
};
