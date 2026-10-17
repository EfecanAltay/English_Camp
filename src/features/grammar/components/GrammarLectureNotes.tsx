import React from 'react';
import { BookOpen, Lightbulb, Check, Sparkles, BookMarked, Clock, Play } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import type { GrammarLesson } from '../../../core/content/grammar-lessons.data';

interface GrammarLectureNotesProps {
  lesson: GrammarLesson;
  activeSectionIndex?: number;
  onSeekTo?: (seconds: number, index: number) => void;
}

export const GrammarLectureNotes: React.FC<GrammarLectureNotesProps> = ({
  lesson,
  activeSectionIndex,
  onSeekTo,
}) => {
  const hasNoNotes =
    !lesson.overview &&
    (!lesson.sections || lesson.sections.length === 0) &&
    (!lesson.examTactics || lesson.examTactics.length === 0) &&
    (!lesson.examples || lesson.examples.length === 0);

  return (
    <div className="space-y-6">
      {/* Genel Bakış */}
      {lesson.overview && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Ders Özeti & Sınav Önemi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/90 leading-relaxed">
            {lesson.overview}
          </CardContent>
        </Card>
      )}

      {/* Alt Başlıklar / Zaman Kuralları */}
      {lesson.sections && lesson.sections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span>Konu Konu Açıklamalı Ders Notları</span>
            <span className="text-xs font-normal lowercase text-muted-foreground">({lesson.sections.length} alt başlık)</span>
          </h3>

          {lesson.sections.map((section, idx) => {
            const isActive = activeSectionIndex === idx;

            return (
              <Card
                key={idx}
                id={`section-card-${idx}`}
                className={cn(
                  "border-border bg-card overflow-hidden transition-all",
                  isActive && "border-primary ring-1 ring-primary/40 shadow-sm"
                )}
              >
                <div className={cn(
                  "px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors",
                  isActive ? "bg-primary/10 border-primary/30" : "bg-muted/40 border-border/60"
                )}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {section.timeRange && (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        )}>
                          <Clock className="h-3 w-3" />
                          <span>{section.timeRange}</span>
                        </span>
                      )}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary animate-pulse">
                          <Play className="h-3 w-3 fill-current" />
                          <span>Şu An Oynatılıyor</span>
                        </span>
                      )}
                    </div>
                    <h4 className={cn(
                      "text-base font-bold transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {section.title}
                    </h4>
                  </div>

                  {section.startSeconds !== undefined && onSeekTo && (
                    <Button
                      size="sm"
                      variant={isActive ? "primary" : "outline"}
                      onClick={() => onSeekTo(section.startSeconds!, idx)}
                      className="h-8 gap-1.5 text-xs font-semibold shrink-0 group self-start sm:self-auto hover:border-primary"
                    >
                      <Play className={cn("h-3.5 w-3.5 fill-current", isActive && "animate-pulse")} />
                      <span>{isActive ? 'Tekrar Başa Sar' : 'Videoda Bu Bölüme Git'}</span>
                    </Button>
                  )}
                </div>

            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {section.description}
              </p>

              {section.formula && (
                <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                    Cümle Formülü / Yapı Mantığı
                  </span>
                  <code className="text-xs sm:text-sm font-mono font-semibold text-foreground">
                    {section.formula}
                  </code>
                </div>
              )}

              {section.timeClues && section.timeClues.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Ayırt Edici Zaman Zarfları (Time Indicators)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {section.timeClues.map((clue, cIdx) => (
                      <span
                        key={cIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>{clue}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {section.tips && section.tips.length > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Hoca Uyarısı & Sınav Tuzağı</span>
                  </span>
                  <ul className="space-y-1 text-xs sm:text-sm text-foreground/90">
                    {section.tips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sınav Taktikleri */}
      {lesson.examTactics && lesson.examTactics.length > 0 && (
        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardHeader className="pb-3 border-b border-primary/20">
            <CardTitle className="text-base font-bold text-amber-700 dark:text-primary flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span>YDS / YÖKDİL Soru Çözüm Taktikleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-2.5">
            {lesson.examTactics.map((tactic, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-amber-800 dark:text-primary font-bold text-[11px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{tactic}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Örnek Akademik Cümleler */}
      {lesson.examples && lesson.examples.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <span>Akademik Örnek Cümleler ve Çözümlemeleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {lesson.examples.map((ex, idx) => (
              <div key={idx} className="rounded-xl border border-border/70 p-4 space-y-2 bg-muted/20">
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  {ex.english}
                </div>
                <div className="text-xs text-muted-foreground italic">
                  "{ex.turkish}"
                </div>
                <div className="text-xs text-primary font-medium bg-primary/[0.05] p-2.5 rounded-lg border border-primary/10">
                  <strong>Gramer Analizi:</strong> {ex.analysis}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Soru Çözüm / Uygulama Videosu İçin Bilgi Kartı */}
      {hasNoNotes && (
        <Card className="border-border bg-card p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Soru Çözümü & Uygulama Videosu</h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Bu bölüm soru çözümü ve uygulama pratiğine ayrılmıştır. Detaylı dilbilgisi kuralları, zaman tabloları ve özet ders notları için bu günün 1. Bölümünü inceleyebilirsiniz.
          </p>
        </Card>
      )}
    </div>
  );
};
