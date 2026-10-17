import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useCampProgress } from '../../../hooks/useCampProgress';
import { PageHeader } from '../../../components/shared/PageHeader';
import { MetricsGrid } from '../../dashboard/components/MetricsGrid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Info } from 'lucide-react';

export const ProgressAnalyticsPage: React.FC = () => {
  const {
    curriculum,
    overall,
    accuracy,
    totalMinutesSpent,
    getDayProgress,
  } = useCampProgress();

  // Her günün gerçek tamamlanma oranı verisi
  const chartData = curriculum.days.map((day) => {
    const p = getDayProgress(day.dayNumber);
    return {
      name: `Gün ${day.dayNumber}`,
      ilerleme: p?.progressPercentage || 0,
      gorev: p?.completedTasks || 0,
    };
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="İlerleme & Analitik"
        description="Kamp süresince kaydettiğiniz somut çalışma metrikleri ve gün bazlı dağılım."
      />

      <MetricsGrid
        overallPercentage={overall.overallPercentage}
        accuracyPercentage={accuracy.accuracyPercentage}
        totalAttempts={accuracy.totalAttempts}
        totalTasksCompleted={overall.totalCompletedTasks}
        totalRequiredTasks={overall.totalRequiredTasks}
        completedRequiredTasks={overall.completedRequiredTasks}
        totalMinutesSpent={totalMinutesSpent}
      />

      {/* Real Day-by-Day Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Günlük Zorunlu Görev Tamamlanma Grafiği
              </CardTitle>
              <CardDescription className="text-xs">
                IndexedDB'de kayıtlı gerçek görev tamamlama yüzdeleriniz
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Gerçek Kullanıcı Verisi
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(value) => [`%${value}`, 'İlerleme']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ilerleme" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Notice about demo vs real stats */}
      <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground">Veri Doğruluk Kuralı:</strong> Bu ekranda gösterilen tüm istatistikler tarayıcınızın yerel IndexedDB veritabanında tutulan gerçek öğrenme aksiyonlarınıza dayanır. Hiçbir yapay veya sahte başarı metriği gerçekmiş gibi sunulmaz.
        </div>
      </div>
    </div>
  );
};
