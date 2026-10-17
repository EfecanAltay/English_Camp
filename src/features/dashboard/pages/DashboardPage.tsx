import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  BookMarked,
  BrainCircuit,
  CheckCircle,
} from 'lucide-react';
import { useCampProgress } from '../../../hooks/useCampProgress';
import { MetricsGrid } from '../components/MetricsGrid';
import { TaskRow } from '../../study-planner/components/TaskRow';
import { SampleDisclaimerBanner } from '../../../components/shared/SampleDisclaimerBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';

export const DashboardPage: React.FC = () => {
  const {
    curriculum,
    allProgress,
    overall,
    accuracy,
    totalMinutesSpent,
    getDayProgress,
    startTask,
    completeTask,
    resetTask,
  } = useCampProgress();

  // Varsayılan olarak 1. gün veya ilk tamamlanmamış gün seçilsin
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  const activeDay = curriculum.days.find((d) => d.dayNumber === selectedDayNumber) || curriculum.days[0];
  const activeDayProgress = getDayProgress(activeDay.dayNumber);

  return (
    <div className="space-y-6">
      {/* Sample Curriculum Disclaimer */}
      <SampleDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Öğrenme Paneli
            </h1>
            <Badge variant="default" className="text-xs">
              {curriculum.title}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            YDS & YÖKDİL hazırlık kampı günlük hedefleri ve çalışma ilerlemen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/camp">
            <Button variant="outline" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Kamp Takvimi</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <MetricsGrid
        overallPercentage={overall.overallPercentage}
        accuracyPercentage={accuracy.accuracyPercentage}
        totalAttempts={accuracy.totalAttempts}
        totalTasksCompleted={overall.totalCompletedTasks}
        totalRequiredTasks={overall.totalRequiredTasks}
        completedRequiredTasks={overall.completedRequiredTasks}
        totalMinutesSpent={totalMinutesSpent}
      />

      {/* Main Grid: Active Day Tasks & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Day Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                    {activeDay.dayNumber}
                  </span>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {activeDay.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5 line-clamp-1">
                      {activeDay.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/camp/day/${activeDay.dayNumber}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                      <span>Gün Detayı</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Day Progress Mini Bar */}
              {activeDayProgress && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">
                      Günlük İlerleme (Zorunlu Görevler)
                    </span>
                    <span className="font-bold text-foreground">
                      %{activeDayProgress.progressPercentage}
                    </span>
                  </div>
                  <Progress value={activeDayProgress.progressPercentage} />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                    <span>
                      {activeDayProgress.completedRequiredTasks} / {activeDayProgress.requiredTasks} zorunlu görev tamamlandı
                    </span>
                    <span>Tahmini: {activeDayProgress.estimatedMinutesTotal} dk</span>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Günün Görevleri ({activeDay.tasks.length})
              </div>

              {activeDay.tasks.map((task) => {
                const p = allProgress.find((item) => item.taskId === task.id);
                return (
                  <TaskRow
                    key={task.id}
                    task={task}
                    progress={p}
                    dayNumber={activeDay.dayNumber}
                    onStart={startTask}
                    onComplete={completeTask}
                    onReset={resetTask}
                  />
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Quick Panels (Right 1 col) */}
        <div className="space-y-4">
          {/* Day Selector Quick Switch */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Kamp Günleri</span>
                <Link to="/camp" className="text-xs text-primary hover:underline">
                  Tümü
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {curriculum.days.map((d) => {
                const dayRes = getDayProgress(d.dayNumber);
                const isSelected = d.dayNumber === selectedDayNumber;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDayNumber(d.dayNumber)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-black/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {d.dayNumber}
                      </span>
                      <span className="truncate">{d.title}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {dayRes?.isCompleted ? (
                        <CheckCircle className={`h-3.5 w-3.5 ${isSelected ? 'text-primary-foreground' : 'text-emerald-500'}`} />
                      ) : (
                        <span className={`text-[11px] ${isSelected ? 'text-primary-foreground/90 font-bold' : 'text-muted-foreground'}`}>
                          %{dayRes?.progressPercentage || 0}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Module Direct Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Öğrenme Modülleri
              </CardTitle>
              <CardDescription className="text-xs">
                Müfredat fazları ve çalışma alanları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Link
                to="/grammar"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-muted/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/15 text-primary font-bold">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Grammar</div>
                    <div className="text-[11px] text-muted-foreground">Kural & Soru Çözümü</div>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Aktif</Badge>
              </Link>

              <Link
                to="/vocabulary"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-muted/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Vocabulary</div>
                    <div className="text-[11px] text-muted-foreground">Flashcard & Eş Anlam</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">Faz 3</Badge>
              </Link>

              <Link
                to="/reading"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-muted/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <BookMarked className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Reading</div>
                    <div className="text-[11px] text-muted-foreground">Akademik Metinler</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">Faz 4</Badge>
              </Link>

              <Link
                to="/skills"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-muted/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Skills</div>
                    <div className="text-[11px] text-muted-foreground">Sınav Tipi Sorular</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">Faz 5</Badge>
              </Link>
            </CardContent>
          </Card>

          {/* Review Center Teaser */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Aralıklı Tekrar (Spaced Repetition)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Yanlış cevaplanan sorular ve günü gelen kelimeler tekrar havuzunda otomatik sıraya alınır.
              </p>
              <Link to="/review" className="mt-3 block">
                <Button size="sm" variant="outline" className="w-full text-xs h-8">
                  Tekrar Merkezine Git
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
