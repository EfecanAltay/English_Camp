import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useCampProgress } from '../../../hooks/useCampProgress';
import { TaskRow } from '../components/TaskRow';
import { SampleDisclaimerBanner } from '../../../components/shared/SampleDisclaimerBanner';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';

export const DayTasksPage: React.FC = () => {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const dayNumber = parseInt(day || '1', 10);

  const {
    curriculum,
    allProgress,
    getDayProgress,
    startTask,
    completeTask,
    resetTask,
  } = useCampProgress();

  const currentDay = curriculum.days.find((d) => d.dayNumber === dayNumber);
  const dayProgress = currentDay ? getDayProgress(dayNumber) : null;

  if (!currentDay) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Gün Bulunamadı</h2>
        <p className="text-muted-foreground text-sm">
          İstediğiniz kamp günü ({day}) müfredat sınırları dışında.
        </p>
        <Link to="/camp">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Kamp Takvimine Dön</span>
          </Button>
        </Link>
      </div>
    );
  }

  const prevDay = dayNumber > 1 ? dayNumber - 1 : null;
  const nextDay = dayNumber < curriculum.totalDays ? dayNumber + 1 : null;

  return (
    <div className="space-y-6">
      <SampleDisclaimerBanner />

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/camp"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tüm Günlere Dön</span>
        </Link>

        {/* Day Pager */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!prevDay}
            onClick={() => prevDay && navigate(`/camp/day/${prevDay}`)}
            className="h-8 px-2 text-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Önceki Gün</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!nextDay}
            onClick={() => nextDay && navigate(`/camp/day/${nextDay}`)}
            className="h-8 px-2 text-xs"
          >
            <span>Sonraki Gün</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Day Overview Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                {currentDay.dayNumber}
              </span>
              <Badge variant="default" className="text-xs">
                Kamp Günü {currentDay.dayNumber} / {curriculum.totalDays}
              </Badge>
              {dayProgress?.isCompleted && (
                <Badge variant="success" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Tüm Zorunlu Görevler Tamam</span>
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {currentDay.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentDay.description}
            </p>
          </div>

          {/* Quick Metrics Badge Box */}
          <div className="flex flex-wrap sm:flex-col items-end gap-2 bg-muted/40 p-3 rounded-xl border border-border/50 shrink-0">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-medium">Toplam Süre</div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1 justify-end">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{dayProgress?.estimatedMinutesTotal} dk</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-medium">Tamamlanma</div>
              <div className="text-sm font-bold text-foreground">
                %{dayProgress?.progressPercentage || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {dayProgress && (
          <div className="mt-6 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
              <span>Zorunlu Görev İlerlemesi</span>
              <span className="font-bold text-foreground">
                {dayProgress.completedRequiredTasks} / {dayProgress.requiredTasks} (%{dayProgress.progressPercentage})
              </span>
            </div>
            <Progress value={dayProgress.progressPercentage} />
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
            Günün Görev Listesi ({currentDay.tasks.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            İlerlemeniz cihazınızın IndexedDB hafızasında saklanır.
          </span>
        </div>

        <div className="space-y-3">
          {currentDay.tasks.map((task) => {
            const p = allProgress.find((item) => item.taskId === task.id);
            return (
              <TaskRow
                key={task.id}
                task={task}
                progress={p}
                dayNumber={currentDay.dayNumber}
                onStart={startTask}
                onComplete={completeTask}
                onReset={resetTask}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
