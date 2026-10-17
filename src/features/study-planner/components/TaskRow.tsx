import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  BookMarked,
  BrainCircuit,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import type { DailyTaskDefinition, TaskProgress } from '../../../core/domain/types';

interface TaskRowProps {
  task: DailyTaskDefinition;
  progress?: TaskProgress;
  dayNumber: number;
  onStart: (taskId: string, dayNumber: number) => void;
  onComplete: (taskId: string, dayNumber: number) => void;
  onReset: (taskId: string, dayNumber: number) => void;
  showModuleLink?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  progress,
  dayNumber,
  onStart,
  onComplete,
  onReset,
  showModuleLink = true,
}) => {
  const status = progress?.status || 'not_started';

  const moduleConfig = {
    grammar: {
      label: 'Grammar',
      icon: BookOpen,
      route: `/grammar/${task.lessonId}`,
      color: 'text-primary',
      badgeColor: 'bg-primary/15 text-amber-800 dark:text-primary border-primary/25',
    },
    vocabulary: {
      label: 'Vocabulary',
      icon: Sparkles,
      route: `/vocabulary`,
      color: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    reading: {
      label: 'Reading',
      icon: BookMarked,
      route: `/reading/${task.lessonId}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    skills: {
      label: 'Skills',
      icon: BrainCircuit,
      route: `/skills/${task.lessonId}`,
      color: 'text-purple-600 dark:text-purple-400',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
  }[task.module];

  const ModuleIcon = moduleConfig.icon;

  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4',
        status === 'completed'
          ? 'bg-card/70 border-emerald-500/30'
          : status === 'in_progress'
          ? 'bg-card border-primary/40 shadow-sm'
          : 'bg-card/90 border-border hover:border-border/80'
      )}
    >
      {/* Left Details */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors mt-0.5',
            status === 'completed'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : status === 'in_progress'
              ? 'bg-primary/10 text-primary animate-pulse'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <ModuleIcon className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border',
                moduleConfig.badgeColor
              )}
            >
              {moduleConfig.label}
            </span>

            {task.required ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Zorunlu
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                Seçmeli
              </Badge>
            )}

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto sm:ml-0">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedMinutes} dk</span>
              {task.targetCount && <span>• {task.targetCount} soru/kelime</span>}
            </div>
          </div>

          <h4
            className={cn(
              'text-sm font-semibold tracking-tight leading-snug',
              status === 'completed' ? 'text-foreground/80 line-through decoration-emerald-500/40' : 'text-foreground'
            )}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}

          {progress?.completedAt && (
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Tamamlandı • {new Date(progress.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {showModuleLink && (
          <Link to={moduleConfig.route}>
            <Button variant="ghost" size="sm" className="text-xs h-8 px-2.5">
              İncele
            </Button>
          </Link>
        )}

        {status === 'not_started' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStart(task.id, dayNumber)}
            className="h-8 gap-1.5 text-xs hover:border-primary hover:text-primary"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Başlat</span>
          </Button>
        )}

        {status === 'in_progress' && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="success"
              onClick={() => onComplete(task.id, dayNumber)}
              className="h-8 gap-1.5 text-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Tamamla</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReset(task.id, dayNumber)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Sıfırla"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
              <Check className="h-3.5 w-3.5" />
              <span>Tamamlandı</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReset(task.id, dayNumber)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Yeniden Başlat"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
