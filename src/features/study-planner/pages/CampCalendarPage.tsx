import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { useCampProgress } from '../../../hooks/useCampProgress';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SampleDisclaimerBanner } from '../../../components/shared/SampleDisclaimerBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';

export const CampCalendarPage: React.FC = () => {
  const { curriculum, getDayProgress, overall } = useCampProgress();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const filteredDays = curriculum.days.filter((day) => {
    const progress = getDayProgress(day.dayNumber);
    if (filterStatus === 'completed') {
      return progress?.isCompleted;
    }
    if (filterStatus === 'pending') {
      return !progress?.isCompleted;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <SampleDisclaimerBanner />

      <PageHeader
        title="Kamp Takvimi"
        description="Gün atlama serbesttir; istediğiniz günün görevine başlayabilir, geçmiş günleri dilediğiniz zaman tekrar edebilirsiniz."
      >
        <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-lg">
          <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tümü ({curriculum.days.length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
              filterStatus === 'completed'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tamamlanan ({overall.completedDaysCount})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
              filterStatus === 'pending'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Kalan ({curriculum.days.length - overall.completedDaysCount})
          </button>
        </div>
      </PageHeader>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDays.map((day) => {
          const dayProg = getDayProgress(day.dayNumber);
          const isDone = dayProg?.isCompleted;
          const hasProgress = (dayProg?.completedTasks || 0) > 0;

          return (
            <Card
              key={day.id}
              className={`flex flex-col justify-between transition-all hover:shadow-md ${
                isDone
                  ? 'border-emerald-500/40 bg-card/60'
                  : hasProgress
                  ? 'border-primary/40 bg-card'
                  : 'border-border bg-card'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : hasProgress
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Gün {day.dayNumber}
                    </span>
                  </div>

                  {isDone ? (
                    <Badge variant="success" className="gap-1 text-[11px]">
                      <Check className="h-3 w-3" />
                      <span>Tamamlandı</span>
                    </Badge>
                  ) : hasProgress ? (
                    <Badge variant="default" className="text-[11px]">
                      %{dayProg?.progressPercentage}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                      Başlanmadı
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base font-bold leading-tight line-clamp-1">
                  {day.title}
                </CardTitle>

                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {day.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 py-2 flex-1">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-muted-foreground mb-1">
                    <span>Zorunlu Görev İlerlemesi</span>
                    <span className="font-bold text-foreground">
                      %{dayProg?.progressPercentage || 0}
                    </span>
                  </div>
                  <Progress value={dayProg?.progressPercentage || 0} />
                </div>

                {/* Task badges */}
                <div className="pt-2 border-t border-border/50">
                  <div className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center justify-between">
                    <span>{day.tasks.length} Görev</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{dayProg?.estimatedMinutesTotal} dk</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {day.tasks.map((t) => (
                      <span
                        key={t.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium border capitalize ${
                          t.module === 'grammar'
                            ? 'bg-primary/15 dark:bg-primary/20 text-amber-800 dark:text-primary border-primary/25'
                            : t.module === 'vocabulary'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : t.module === 'reading'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        {t.module}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <Link to={`/camp/day/${day.dayNumber}`} className="w-full">
                  <Button
                    variant={isDone ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full gap-2 text-xs"
                  >
                    <span>{isDone ? 'Günü İncele / Tekrar Et' : 'Görevleri Başlat'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
