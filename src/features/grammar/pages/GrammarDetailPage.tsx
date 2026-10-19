import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ExternalLink,
  Check,
  Layers,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Film,
  X,
  BookMarked,
  Plus,
  Sparkles,
} from 'lucide-react';
import { GRAMMAR_LESSONS, getGrammarLessonById, type GrammarLesson } from '../../../core/content/grammar-lessons.data';
import { YouTubeEmbed, type YouTubeEmbedHandle } from '../../../components/ui/youtube-embed';
import { GrammarLectureNotes } from '../components/GrammarLectureNotes';
import { GrammarQuiz } from '../components/GrammarQuiz';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { useCampProgress } from '../../../hooks/useCampProgress';
import { taskProgressRepository } from '../../../core/database/repositories/task-progress.repository';
import { useSavedWords } from '../../../hooks/useSavedWords';
import { WordModal } from '../../vocabulary/components/WordModal';
import { WordCard } from '../../vocabulary/components/WordCard';
import type { SavedWord } from '../../../core/domain/types';
import type { CreateWordInput } from '../../../core/database/repositories/saved-words.repository';
import { cn } from '../../../lib/utils';

interface GrammarDayGroup {
  dayNumber: number;
  title: string;
  subtitle: string;
  primaryLesson: GrammarLesson;
  lessons: GrammarLesson[];
  totalDurationMinutes: number;
}

function cleanLessonTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\s*\|\s*.*$/, '')
    .replace(/^(Day|Gün)\s*\d+\s*[–-]\s*/i, '')
    .trim();
}

export const GrammarDetailPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Günlere göre gramer derslerini grupla
  const dayGroups = useMemo<GrammarDayGroup[]>(() => {
    const map = new Map<number, GrammarLesson[]>();
    for (const l of GRAMMAR_LESSONS) {
      const list = map.get(l.dayNumber) || [];
      list.push(l as GrammarLesson);
      map.set(l.dayNumber, list);
    }

    const groups: GrammarDayGroup[] = [];
    map.forEach((lessons, dayNumber) => {
      const primary = lessons[0];
      const totalDuration = lessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

      let title = cleanLessonTitle(primary.title);
      let subtitle = primary.subtitle;

      if (dayNumber === 0) {
        title = 'Kamp Başlangıcı & Cümle Mantığı';
        subtitle = 'Yol haritası, çalışma programı ve TO BE mantığı';
      } else if (!subtitle) {
        subtitle =
          lessons.length > 1
            ? `${lessons.length} video ders & pekiştirme`
            : 'Konu anlatımı ve alıştırmalar';
      }

      groups.push({
        dayNumber,
        title,
        subtitle,
        primaryLesson: primary,
        lessons,
        totalDurationMinutes: totalDuration,
      });
    });

    return groups.sort((a, b) => a.dayNumber - b.dayNumber);
  }, []);

  // Dersi yükle; yoksa ilk dersi al
  const lesson = (lessonId && getGrammarLessonById(lessonId)) || GRAMMAR_LESSONS[0];

  // Aktif güne ait tüm bölümler
  const currentDayGroup = dayGroups.find((g) => g.dayNumber === lesson.dayNumber);
  const currentDayLessons = currentDayGroup?.lessons || [lesson];
  const activePartIndex = currentDayLessons.findIndex((l) => l.id === lesson.id);

  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'words'>('notes');
  const [currentVideoSeconds, setCurrentVideoSeconds] = useState<number>(0);
  const [isWordModalOpen, setIsWordModalOpen] = useState<boolean>(false);
  const [editingWord, setEditingWord] = useState<SavedWord | null>(null);

  const { words, addWord, updateWord, deleteWord, toggleStatus, toggleFavorite } = useSavedWords();

  // Bu derse ait kaydedilen kelimeler
  const lessonWords = useMemo(
    () => (words as SavedWord[]).filter((w: SavedWord) => w.sourceLessonId === lesson.id),
    [words, lesson.id]
  );

  const handleSaveLessonWord = async (wordData: CreateWordInput, id?: string) => {
    if (id) {
      await updateWord(id, wordData);
    } else {
      await addWord(wordData);
    }
  };

  const handleDeleteLessonWord = async (id: string) => {
    if (window.confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) {
      await deleteWord(id);
    }
  };

  const { allProgress, completeTask, startTask, resetTask } = useCampProgress();
  const videoPlayerRef = useRef<YouTubeEmbedHandle | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(-1);

  // Sinema Modu (Geniş Ekran) Durumu - localStorage ile hatırlanır
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('grammar_cinema_mode') === 'true';
  });

  // Sinema modundayken gün listesini yan çekmece (drawer) olarak açma durumu
  const [isDayListDrawerOpen, setIsDayListDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('grammar_cinema_mode', isCinemaMode ? 'true' : 'false');
    } catch {
      // yoksay
    }
  }, [isCinemaMode]);

  // Klavye Kısayolları: 'T' sinema modunu açıp kapatır, 'Escape' çekmeceyi veya sinema modunu kapatır
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

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsCinemaMode((prev) => !prev);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setEditingWord(null);
        setIsWordModalOpen(true);
      } else if (e.key === 'Escape') {
        if (isDayListDrawerOpen) {
          e.preventDefault();
          setIsDayListDrawerOpen(false);
        } else if (isCinemaMode) {
          e.preventDefault();
          setIsCinemaMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinemaMode, isDayListDrawerOpen]);

  // Ders değiştiğinde aktif bölüm indeksini sıfırla
  useEffect(() => {
    setActiveSectionIndex(-1);
  }, [lesson.id]);

  const handleSeekToSection = (seconds: number, index?: number) => {
    if (index !== undefined) {
      setActiveSectionIndex(index);
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(seconds);
    }
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      if (rect.top < 60) {
        videoContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Belirli bir video dersinin (bölümün) tamamlanıp tamamlanmadığını kontrol et
  const isPartCompleted = (lessonId: string, dayNum?: number, totalInDay?: number): boolean => {
    const directMatch = allProgress.some(
      (p) =>
        (p.taskId === `grammar-part-${lessonId}` || p.taskId === lessonId) &&
        p.status === 'completed'
    );
    if (directMatch) return true;

    // Eğer o günde yalnızca 1 bölüm varsa ve ana görev bitmişse
    if (totalInDay === 1 && dayNum !== undefined) {
      return allProgress.some(
        (p) => p.taskId === `d${dayNum}-t1-grammar` && p.status === 'completed'
      );
    }
    return false;
  };

  // Belirtilen günün tüm bölümleri tamamlandı mı?
  const isDayGroupCompleted = (lessons: GrammarLesson[]): boolean => {
    if (lessons.length === 0) return false;
    return lessons.every((l) => isPartCompleted(l.id, l.dayNumber, lessons.length));
  };

  // Belirtilen günde tamamlanan bölüm sayısı
  const getDayGroupCompletedCount = (lessons: GrammarLesson[]): number => {
    return lessons.filter((l) => isPartCompleted(l.id, l.dayNumber, lessons.length)).length;
  };

  const isCurrentPartDone = isPartCompleted(lesson.id, lesson.dayNumber, currentDayLessons.length);
  const isCurrentDayDone = isDayGroupCompleted(currentDayLessons);
  const currentDayCompletedCount = getDayGroupCompletedCount(currentDayLessons);

  // Eğer geçerli bölümde quiz yoksa ve aktif sekme quiz ise notlara dön
  useEffect(() => {
    if ((!lesson.quiz || lesson.quiz.length === 0) && activeTab === 'quiz') {
      setActiveTab('notes');
    }
  }, [lesson.id, lesson.quiz?.length, activeTab]);

  useEffect(() => {
    const partTaskId = `grammar-part-${lesson.id}`;
    const partTask = allProgress.find((p) => p.taskId === partTaskId);
    if (!partTask || partTask.status === 'not_started') {
      startTask(partTaskId, lesson.dayNumber);
    }
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [lesson.id, lesson.dayNumber]);

  // Geçerli bölümü tamamla
  const handleCompleteCurrentPart = async () => {
    const partTaskId = `grammar-part-${lesson.id}`;
    await completeTask(partTaskId, lesson.dayNumber, 100);

    // Günün diğer tüm bölümleri tamamlanmış mı?
    const otherPartsDone = currentDayLessons
      .filter((l) => l.id !== lesson.id)
      .every((l) => isPartCompleted(l.id, lesson.dayNumber, currentDayLessons.length));

    if (otherPartsDone) {
      // TÜM BÖLÜMLER BİTTİ -> GÜN TAMAMLANDI!
      await completeTask(`d${lesson.dayNumber}-t1-grammar`, lesson.dayNumber, 100);
    } else {
      // Kısmi tamamlandı
      const count = currentDayLessons.filter(
        (l) => l.id === lesson.id || isPartCompleted(l.id, lesson.dayNumber, currentDayLessons.length)
      ).length;
      const score = Math.round((count / currentDayLessons.length) * 100);
      await taskProgressRepository.setStatus(
        `d${lesson.dayNumber}-t1-grammar`,
        lesson.dayNumber,
        'in_progress',
        score
      );
    }
  };

  // Geçerli bölümün tamamlanmasını sıfırla
  const handleResetCurrentPart = async () => {
    const partTaskId = `grammar-part-${lesson.id}`;
    await resetTask(partTaskId, lesson.dayNumber);
    await resetTask(lesson.id, lesson.dayNumber);

    // Kalan tamamlanmış bölümleri hesapla
    const remainingCount = currentDayLessons.filter(
      (l) => l.id !== lesson.id && isPartCompleted(l.id, lesson.dayNumber, currentDayLessons.length)
    ).length;

    if (remainingCount === 0) {
      await resetTask(`d${lesson.dayNumber}-t1-grammar`, lesson.dayNumber);
    } else {
      const score = Math.round((remainingCount / currentDayLessons.length) * 100);
      await taskProgressRepository.setStatus(
        `d${lesson.dayNumber}-t1-grammar`,
        lesson.dayNumber,
        'in_progress',
        score
      );
    }
  };

  // Günün tüm bölümlerini sıfırla
  const handleResetEntireDay = async () => {
    for (const l of currentDayLessons) {
      await resetTask(`grammar-part-${l.id}`, lesson.dayNumber);
      await resetTask(l.id, lesson.dayNumber);
    }
    await resetTask(`d${lesson.dayNumber}-t1-grammar`, lesson.dayNumber);
  };

  const handleQuizFinished = async (score: number) => {
    const partTaskId = `grammar-part-${lesson.id}`;
    await completeTask(partTaskId, lesson.dayNumber, score);

    const otherPartsDone = currentDayLessons
      .filter((l) => l.id !== lesson.id)
      .every((l) => isPartCompleted(l.id, lesson.dayNumber, currentDayLessons.length));

    if (otherPartsDone) {
      await completeTask(`d${lesson.dayNumber}-t1-grammar`, lesson.dayNumber, score);
    }
  };

  // Sağ taraftaki Gün Listesi Kartını / Çekmecesini Oluştur
  const renderDayPlaylist = (isDrawer = false) => (
    <Card className={cn("border-border flex flex-col shadow-sm", isDrawer && "border-0 shadow-none bg-transparent")}>
      <CardHeader className={cn("pb-3 border-b border-border/50 shrink-0", isDrawer ? "bg-muted/40 rounded-xl mb-2" : "bg-card")}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <span>Gramer Günlük Kamp Serisi</span>
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              18 Günde YDS / YÖKDİL Kampı
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[11px] font-semibold bg-muted/60">
              {dayGroups.findIndex((g) => g.dayNumber === lesson.dayNumber) + 1} / {dayGroups.length} Gün
            </Badge>
            {!isDrawer ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCinemaMode(true)}
                title="Listeyi Kapat ve Sinema Moduna Geç (Kısayol: T)"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <PanelRightClose className="h-3.5 w-3.5" />
                <span className="sr-only">Listeyi Kapat</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDayListDrawerOpen(false)}
                title="Listeyi Kapat (Esc)"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Kapat</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("p-2.5 space-y-2 pr-1.5 overflow-y-auto", isDrawer ? "flex-1 max-h-[calc(100vh-180px)]" : "max-h-[460px]")}>
        {dayGroups.map((group) => {
          const isCurrentDay = group.dayNumber === lesson.dayNumber;
          const isDayDone = isDayGroupCompleted(group.lessons);
          const completedCount = getDayGroupCompletedCount(group.lessons);

          return (
            <button
              key={group.dayNumber}
              ref={isCurrentDay ? activeItemRef : null}
              onClick={() => {
                if (!isCurrentDay) {
                  navigate(`/grammar/${group.lessons[0].id}`);
                  if (isDrawer) setIsDayListDrawerOpen(false);
                }
              }}
              className={cn(
                "w-full text-left p-3 rounded-xl border text-xs transition-all relative",
                isDayDone
                  ? isCurrentDay
                    ? "border-2 border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/70 shadow-md ring-2 ring-emerald-500/40"
                    : "border-2 border-emerald-500/70 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 shadow-xs"
                  : isCurrentDay
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                    : "border-border/70 hover:bg-muted/50 bg-card hover:border-border"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                      isDayDone
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrentDay
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDayDone && <CheckCircle2 className="h-2.5 w-2.5" />}
                    <span>Gün {group.dayNumber}</span>
                  </span>
                  {group.lessons.length > 1 && (
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      isDayDone
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold"
                        : "bg-muted/80 text-muted-foreground"
                    )}>
                      {group.lessons.length} Bölüm
                    </span>
                  )}
                  {isCurrentDay && (
                    <span className={cn(
                      "text-[10px] font-semibold animate-pulse flex items-center gap-0.5",
                      isDayDone ? "text-emerald-700 dark:text-emerald-300" : "text-primary"
                    )}>
                      <Play className="h-2.5 w-2.5 fill-current" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{group.totalDurationMinutes} dk</span>
                </div>
              </div>

              <div
                className={cn(
                  "font-bold line-clamp-1",
                  isDayDone
                    ? "text-emerald-950 dark:text-emerald-100"
                    : isCurrentDay
                      ? "text-primary"
                      : "text-foreground"
                )}
              >
                {group.title}
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-muted-foreground line-clamp-1 text-[11px]">
                  {group.subtitle}
                </span>
                {isDayDone ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 dark:bg-emerald-500/30 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0 ml-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                    <span>Tamamlandı</span>
                    {group.lessons.length > 1 && <span className="opacity-80">({group.lessons.length}/{group.lessons.length})</span>}
                  </span>
                ) : completedCount > 0 ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0 ml-1">
                    <span>{completedCount}/{group.lessons.length} Bölüm</span>
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6 mx-auto transition-all duration-300", isCinemaMode ? "max-w-[1440px]" : "max-w-6xl")}>
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/grammar"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tüm Gramer Konularına Dön</span>
        </Link>

        <a
          href={`https://www.youtube.com/playlist?list=${lesson.playlistId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          <span>YouTube 18 Günde Kamp Playlisti</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Lesson Header */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs">
                Gün {lesson.dayNumber} • Grammar Modülü
              </Badge>
              {currentDayLessons.length > 1 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold transition-colors",
                    isCurrentPartDone
                      ? "border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                      : "bg-muted/60"
                  )}
                >
                  {activePartIndex >= 0 ? activePartIndex + 1 : 1}. Bölüm / {currentDayLessons.length} Bölüm
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {lesson.instructor}
              </span>
              {isCurrentDayDone ? (
                <Badge className="bg-emerald-600 text-white font-bold gap-1 text-xs px-2.5 py-0.5 shadow-sm border border-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Gün {lesson.dayNumber} Tamamlandı! ({currentDayLessons.length}/{currentDayLessons.length})</span>
                </Badge>
              ) : isCurrentPartDone ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold gap-1 text-xs border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Bu Bölüm Tamamlandı</span>
                </Badge>
              ) : null}
              {currentDayLessons.length > 1 && !isCurrentDayDone && currentDayCompletedCount > 0 && (
                <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10">
                  {currentDayCompletedCount}/{currentDayLessons.length} Bölüm Bitti
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {lesson.title}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {lesson.subtitle || cleanLessonTitle(lesson.title)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Kelime Not Al Butonu */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingWord(null);
                setIsWordModalOpen(true);
              }}
              className="gap-1.5 text-xs h-9 font-semibold border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
              title="Bu video dersinden bilinmeyen kelime not al (Kısayol: W)"
            >
              <BookMarked className="h-4 w-4" />
              <span>Kelime Not Al</span>
              {lessonWords.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary font-bold">
                  {lessonWords.length}
                </Badge>
              )}
              <kbd className="hidden md:inline-flex items-center px-1 py-0.2 rounded text-[9px] font-mono bg-muted text-muted-foreground border border-border/60 ml-0.5">
                W
              </kbd>
            </Button>

            {/* Sinema Modu (Geniş Ekran) Aç/Kapat Butonu */}
            <Button
              size="sm"
              variant={isCinemaMode ? "default" : "outline"}
              onClick={() => setIsCinemaMode((prev) => !prev)}
              className={cn(
                "gap-1.5 text-xs h-9 font-semibold transition-all",
                isCinemaMode
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-muted hover:border-primary/50"
              )}
              title={isCinemaMode ? "Normal Görünüme Dön (Kısayol: T)" : "Sinema Modunu Aç (Kısayol: T)"}
            >
              {isCinemaMode ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span>Normal Görünüm</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 text-primary" />
                  <span>Sinema Modu</span>
                </>
              )}
              <kbd className="hidden md:inline-flex items-center px-1 py-0.2 rounded text-[9px] font-mono bg-muted/80 text-muted-foreground border border-border/60 ml-0.5">
                T
              </kbd>
            </Button>

            {!isCurrentPartDone ? (
              <Button
                size="sm"
                variant="success"
                onClick={handleCompleteCurrentPart}
                className="gap-2 text-xs h-9 font-bold shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>
                  {currentDayLessons.length > 1
                    ? `${activePartIndex + 1}. Bölümü Tamamla`
                    : 'Dersi Tamamlandı Olarak İşaretle'}
                </span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-500/40 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {currentDayLessons.length > 1
                      ? `${activePartIndex + 1}. Bölüm Tamamlandı`
                      : 'Ders Tamamlandı'}
                  </span>
                </div>

                {/* Yanında Tekrar Sıfırlaması */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetCurrentPart}
                  title="Bu bölümün tamamlanmasını sıfırla"
                  className="gap-1.5 text-xs h-8 px-2.5 font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border/70 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Sıfırla</span>
                </Button>
              </div>
            )}

            {/* Günün tüm bölümleri bittiğinde ve birden fazla bölüm varsa Günü Sıfırla */}
            {isCurrentDayDone && currentDayLessons.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetEntireDay}
                title="Günün tüm bölümlerini sıfırla"
                className="text-[11px] h-8 px-2 text-muted-foreground hover:text-destructive gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Tüm Günü Sıfırla</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sinema Modu Bilgilendirme ve Hızlı Çekmece Çubuğu */}
      {isCinemaMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/25 shadow-xs animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs shrink-0">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Sinema Modu Devrede</span>
                <Badge variant="outline" className="text-[10px] font-semibold bg-primary/15 text-primary border-primary/30">
                  Genişletilmiş Ekran
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Gramer gün listesi kapatılarak video tam ekran genişliğine alındı. Normal görünüme dönmek için klavyeden <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground border border-border/60">T</kbd> veya <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground border border-border/60">Esc</kbd> tuşuna basabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDayListDrawerOpen(true)}
              className="h-8 text-xs gap-1.5 border-border hover:border-primary/50"
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Gün Listesi ({dayGroups.length} Gün)</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCinemaMode(false)}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
              <span>Normal Görünüm</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Video Player + Playlist Navigator */}
      <div className={cn("grid gap-6 transition-all duration-300", isCinemaMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
        {/* Left (veya Sinema Modunda Tam Genişlik) Bölüm: Tabs, YouTube Embed, Notes/Quiz */}
        <div className={cn("space-y-4 transition-all duration-300", isCinemaMode ? "col-span-1" : "lg:col-span-2")}>
          {/* Günün Bölümleri Sekmeleri (Detay Kısmında Tabla Ayrılmış Bölümler) */}
          {currentDayLessons.length > 1 && (
            <div className="rounded-2xl border border-border bg-card p-3 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between px-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Günün Bölümleri ({currentDayLessons.length} Bölüm)</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Toplam {currentDayGroup?.totalDurationMinutes} dk
                </span>
              </div>

              {/* Bölüm Tabları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentDayLessons.map((partLesson, idx) => {
                  const isPartActive = partLesson.id === lesson.id;
                  const isPartDone = isPartCompleted(partLesson.id, lesson.dayNumber, currentDayLessons.length);

                  return (
                    <button
                      key={partLesson.id}
                      onClick={() => navigate(`/grammar/${partLesson.id}`)}
                      className={cn(
                        "flex flex-col text-left p-3 rounded-xl border text-xs transition-all relative group",
                        isPartDone
                          ? isPartActive
                            ? "border-2 border-emerald-500 bg-emerald-100/80 dark:bg-emerald-950/80 shadow-md ring-2 ring-emerald-500/40"
                            : "border-2 border-emerald-500/80 bg-emerald-50/90 dark:bg-emerald-950/50 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 shadow-sm"
                          : isPartActive
                            ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                            : "border-border/70 hover:bg-muted/50 bg-background hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-1",
                              isPartDone
                                ? "bg-emerald-600 text-white shadow-xs"
                                : isPartActive
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                            )}
                          >
                            {isPartDone && <CheckCircle2 className="h-2.5 w-2.5" />}
                            <span>{idx + 1}. Bölüm</span>
                          </span>
                          {isPartActive && (
                            <span className={cn(
                              "text-[10px] font-semibold flex items-center gap-1 animate-pulse",
                              isPartDone ? "text-emerald-700 dark:text-emerald-300" : "text-primary"
                            )}>
                              <Play className="h-2.5 w-2.5 fill-current" />
                              <span>Oynatılıyor</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{partLesson.durationMinutes} dk</span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "font-bold line-clamp-1 text-xs",
                          isPartDone
                            ? "text-emerald-950 dark:text-emerald-100"
                            : isPartActive
                              ? "text-primary"
                              : "text-foreground"
                        )}
                      >
                        {cleanLessonTitle(partLesson.title)}
                      </div>

                      <div className="flex items-center justify-between mt-1.5 text-[11px]">
                        <span className="text-muted-foreground line-clamp-1 text-[10px]">
                          {partLesson.subtitle || (idx === 0 ? 'Konu Anlatımı' : 'Soru Çözümü & Alıştırma')}
                        </span>
                        {isPartDone ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded shrink-0 ml-1 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 fill-current" />
                            <span>Tamamlandı</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/70 shrink-0 ml-1">
                            Bekliyor
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={videoContainerRef} id="video-player-container">
            <YouTubeEmbed
              ref={videoPlayerRef}
              videoId={lesson.videoId}
              title={lesson.title}
              playlistId={lesson.playlistId}
              sections={lesson.sections}
              activeSectionIndex={activeSectionIndex}
              isCinemaMode={isCinemaMode}
              onToggleCinemaMode={() => setIsCinemaMode((prev) => !prev)}
              onSectionSelect={(section, idx) => {
                if (section.startSeconds !== undefined) {
                  handleSeekToSection(section.startSeconds, idx);
                }
              }}
              onTimeUpdate={(seconds) => {
                setCurrentVideoSeconds(seconds);
                const idx = (lesson.sections || []).findIndex((s) => {
                  if (s.startSeconds === undefined) return false;
                  const end = s.endSeconds !== undefined ? s.endSeconds : Infinity;
                  return seconds >= s.startSeconds && seconds <= end;
                });
                if (idx !== -1 && idx !== activeSectionIndex) {
                  setActiveSectionIndex(idx);
                }
              }}
            />
          </div>

          {/* Tab Selector: Ders Notları vs Quiz vs Kelimelerim */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Ders Notları & Açıklamalar</span>
              </button>

              {lesson.quiz && lesson.quiz.length > 0 ? (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'quiz'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>Konu Quizi ({lesson.quiz.length} Soru)</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground bg-muted/30">
                  <Award className="h-3.5 w-3.5 opacity-50" />
                  <span>Quiz video içerisinde</span>
                </div>
              )}

              <button
                onClick={() => setActiveTab('words')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'words'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <BookMarked className="h-4 w-4" />
                <span>Ders Kelimeleri</span>
                {lessonWords.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'words'
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {lessonWords.length}
                  </span>
                )}
              </button>
            </div>

            {/* Hızlı Kelime Ekle Butonu */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingWord(null);
                setIsWordModalOpen(true);
              }}
              className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Kelime Not Al</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 rounded text-[9px] font-mono bg-muted text-muted-foreground border border-border/60">
                W
              </kbd>
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'notes' ? (
            <GrammarLectureNotes
              lesson={lesson}
              activeSectionIndex={activeSectionIndex}
              onSeekTo={(seconds, idx) => handleSeekToSection(seconds, idx)}
            />
          ) : activeTab === 'quiz' ? (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Bu quizdeki sorular Dilci Burak Hoca'nın video anlatımındaki kural ve sınav taktiklerine göre hazırlanmıştır. Yanıtlarınız IndexedDB'ye anında işlenir.
              </div>
              <GrammarQuiz
                taskId={`grammar-part-${lesson.id}`}
                questions={lesson.quiz}
                onQuizComplete={handleQuizFinished}
              />
            </div>
          ) : (
            /* activeTab === 'words' */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-primary" />
                    <span>Bu Dersten Not Alınan Bilinmeyen Kelimeler</span>
                    <Badge variant="outline" className="text-xs font-bold bg-primary/10 text-primary border-primary/20">
                      {lessonWords.length} Kelime
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Videodaki saniye etiketine tıklayarak doğrudan o kelimenin anlatıldığı ana gidebilirsiniz.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/vocabulary"
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Tüm Kelime Defterine Git</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setEditingWord(null);
                      setIsWordModalOpen(true);
                    }}
                    className="h-8 text-xs font-bold gap-1 bg-primary text-primary-foreground shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Yeni Kelime Ekle</span>
                  </Button>
                </div>
              </div>

              {lessonWords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(lessonWords as SavedWord[]).map((word: SavedWord) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      onEdit={(w: SavedWord) => {
                        setEditingWord(w);
                        setIsWordModalOpen(true);
                      }}
                      onDelete={handleDeleteLessonWord}
                      onToggleStatus={toggleStatus}
                      onToggleFavorite={toggleFavorite}
                      onSeekToVideo={(secs) => handleSeekToSection(secs)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border/80 p-8 text-center space-y-3 bg-card/40">
                  <BookMarked className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                  <div className="space-y-1 max-w-sm mx-auto">
                    <div className="text-sm font-bold text-foreground">
                      Bu derse henüz kelime eklenmemiş
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Videoyu izlerken bilmediğiniz bir kelimeyle karşılaştığınızda klavyeden <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">W</kbd> tuşuna basabilir veya aşağıdaki butona tıklayabilirsiniz.
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setEditingWord(null);
                      setIsWordModalOpen(true);
                    }}
                    className="gap-1.5 text-xs font-bold h-9 px-4"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Bu Derse Kelime Not Et</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Playlist & Camp Info (Sinema modunda kapanır) */}
        {!isCinemaMode && (
          <div className="space-y-5 animate-in fade-in-50 duration-300">
            {renderDayPlaylist(false)}

            {/* Quick Study Advice */}
            <Card className="bg-gradient-to-br from-primary/10 to-amber-500/5 border-primary/20">
              <CardContent className="p-4 space-y-2.5 text-xs leading-relaxed text-foreground/90">
                <div className="font-bold text-amber-700 dark:text-primary flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Önerilen Çalışma Sırası</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Videoyu duraklatmadan 1 kez dikkatle izleyin.</li>
                  <li>Alt kısımdaki <strong>Ders Notları</strong> ve <strong>Zaman Zarfları</strong> tablosunu okuyun.</li>
                  <li><strong>Konu Quizi</strong> sekmesine geçerek soruları çözün ve çözüm analizlerini inceleyin.</li>
                  <li>Dersi tamamlandı olarak işaretleyip kamp takvimindeki diğer görevlere geçin.</li>
                </ol>
              </CardContent>
            </Card>

            {/* Tenses Lab Quick Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/25 space-y-2 text-xs">
              <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tenses Lab'da Canlandır</span>
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                  İnteraktif
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                12 İngilizce zamanı hareketli zaman çizgisinde izleyin, formülleri ve mantığı kavrayın.
              </p>
              <Link to="/grammar/tenses-lab" className="block pt-1">
                <Button size="sm" variant="outline" className="w-full h-8 text-xs font-bold border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15">
                  Zamanlar Laboratuvarını Aç →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sinema Modunda Açılabilen Yan Çekmece (Drawer) */}
      {isCinemaMode && isDayListDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDayListDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Sinema Modu • Kamp Günleri</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCinemaMode(false);
                    setIsDayListDrawerOpen(false);
                  }}
                  className="h-7 text-[11px] gap-1"
                >
                  <PanelRightOpen className="h-3 w-3" />
                  <span>Normal Görünüm</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDayListDrawerOpen(false)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {renderDayPlaylist(true)}
            </div>
          </div>
        </div>
      )}

      {/* Sinema Modunda Sabit Yüzen Hızlı Liste Butonu */}
      {isCinemaMode && !isDayListDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsDayListDrawerOpen(true)}
          className="fixed right-5 bottom-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl text-xs font-bold text-foreground hover:border-primary transition-all hover:scale-105 group"
          title="Gün Listesini Aç (Sinema Modunda)"
        >
          <PanelRightOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Gün Listesi ({dayGroups.length} Gün)</span>
          <span className="sm:hidden">Günler</span>
        </button>
      )}

      {/* Kelime Ekleme / Düzenleme Modalı */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => {
          setIsWordModalOpen(false);
          setEditingWord(null);
        }}
        onSave={handleSaveLessonWord}
        initialWord={editingWord}
        defaultLessonId={lesson.id}
        defaultLessonTitle={lesson.title}
        defaultVideoTimestamp={currentVideoSeconds}
      />
    </div>
  );
};
