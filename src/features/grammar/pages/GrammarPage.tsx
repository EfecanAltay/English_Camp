import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { GRAMMAR_LESSONS } from '../../../core/content/grammar-lessons.data';
import { useCampProgress } from '../../../hooks/useCampProgress';
import { cn } from '../../../lib/utils';

export const GrammarPage: React.FC = () => {
  const { allProgress } = useCampProgress();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Grammar (Gramer & Yapı Bilgisi)"
        description="Dilci Burak Hoca ile 18 Günde YDS–YÖKDİL–YDT Kampı video dersleri, konu konu açıklamalı ders notları ve çözümlü soru pratikleri."
      >
        <a
          href="https://www.youtube.com/playlist?list=PLZ8NNzfwIohAWvt5rRPjFcv9rfk8jRjpS"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <span>Tüm YouTube Oynatma Listesi</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
      </PageHeader>

      {/* Featured Video Lesson Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600 text-white">
                <Play className="h-3.5 w-3.5 fill-current" />
              </span>
              <Badge variant="default" className="text-xs">
                YouTube Video Ders Serisi
              </Badge>
              <span className="text-xs text-muted-foreground">
                Tenses Part 1 • ce2zVJur69o
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Tenses (Zamanlar) Konu Anlatımı ve Sınav Taktikleri
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Doğrudan video gösterimi üzerinden dersi takip edebilir, hemen altındaki detaylı konu notlarını, zaman zarflarını ve VIBE stratejisini inceleyebilirsiniz.
            </p>
          </div>

          <Link to={`/grammar/${GRAMMAR_LESSONS[0].id}`}>
            <Button size="lg" className="gap-2 text-sm shadow-md">
              <Play className="h-4 w-4 fill-current" />
              <span>1. Derse Başla (Tenses Part 1)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Lessons List Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Gramer Dersleri & Konu Açıklamaları ({GRAMMAR_LESSONS.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRAMMAR_LESSONS.map((lesson) => {
            const isSingleLessonDay = GRAMMAR_LESSONS.filter((l) => l.dayNumber === lesson.dayNumber).length === 1;
            const isDone = allProgress.some(
              (item) =>
                ((item.taskId === `grammar-part-${lesson.id}` || item.taskId === lesson.id) &&
                  item.status === 'completed') ||
                (isSingleLessonDay &&
                  item.taskId === `d${lesson.dayNumber}-t1-grammar` &&
                  item.status === 'completed')
            );

            return (
              <Card
                key={lesson.id}
                className={cn(
                  "flex flex-col justify-between transition-all hover:shadow-md",
                  isDone
                    ? "border-2 border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/25 shadow-xs"
                    : "border-border bg-card"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                        isDone ? "bg-emerald-600 text-white" : "bg-primary/10 text-primary"
                      )}>
                        {isDone && <CheckCircle2 className="h-3 w-3" />}
                        <span>Gün {lesson.dayNumber}</span>
                      </span>
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <span>Tamamlandı</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.durationMinutes} dk</span>
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold leading-tight">
                    {lesson.title}
                  </CardTitle>

                  <CardDescription className="text-xs mt-1 line-clamp-2">
                    {lesson.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 py-2 flex-1">
                  <div className="text-xs text-muted-foreground line-clamp-3">
                    {lesson.overview}
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      İçerik Bölümleri ({lesson.sections.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {lesson.sections.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted/80 text-muted-foreground font-medium"
                        >
                          {s.timeRange && (
                            <span className="font-mono text-[9px] opacity-75 text-primary">
                              {s.timeRange.split(' - ')[0]}
                            </span>
                          )}
                          <span>{s.title.split('(')[0].trim()}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/50">
                  <Link to={`/grammar/${lesson.id}`} className="w-full">
                    <Button
                      variant={isDone ? 'outline' : 'primary'}
                      size="sm"
                      className={cn(
                        "w-full gap-2 text-xs font-semibold",
                        isDone && "border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                      )}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Tamamlandı • Tekrar İncele</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Videoyu İzle & Notları Oku</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                        </>
                      )}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
