import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Target, CheckCircle2, Clock, Flame } from 'lucide-react';

interface MetricsGridProps {
  overallPercentage: number;
  accuracyPercentage: number;
  totalAttempts: number;
  totalTasksCompleted: number;
  totalRequiredTasks: number;
  completedRequiredTasks: number;
  totalMinutesSpent: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  overallPercentage,
  accuracyPercentage,
  totalAttempts,
  totalTasksCompleted,
  totalRequiredTasks,
  completedRequiredTasks,
  totalMinutesSpent,
}) => {
  const metrics = [
    {
      title: 'Kamp İlerlemesi',
      value: `%${overallPercentage}`,
      subtitle: `${completedRequiredTasks}/${totalRequiredTasks} Zorunlu Görev`,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/15',
    },
    {
      title: 'Soru Doğruluk Oranı',
      value: totalAttempts > 0 ? `%${accuracyPercentage}` : '—',
      subtitle: totalAttempts > 0 ? `${totalAttempts} Soru Girişimi` : 'Henüz test çözülmedi',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Tamamlanan Görev',
      value: totalTasksCompleted,
      subtitle: 'Tüm modüller dahil',
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Toplam Çalışma Süresi',
      value: `${totalMinutesSpent} dk`,
      subtitle: 'Öğrenme oturumları',
      icon: Clock,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <Card key={idx} className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {m.title}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.bgColor} ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {m.value}
                </span>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {m.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
