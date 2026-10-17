import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Sparkles,
  BookMarked,
  BrainCircuit,
  RotateCcw,
  BarChart3,
  Settings,
  Sun,
  Moon,
  GraduationCap,
  HardDrive,
} from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useCampProgress } from '../../hooks/useCampProgress';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const { overall } = useCampProgress();

  const mainLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/camp', label: 'Kamp Takvimi', icon: CalendarDays },
  ];

  const moduleLinks = [
    { to: '/grammar', label: 'Grammar', icon: BookOpen, badge: 'Aktif' },
    { to: '/vocabulary', label: 'Vocabulary', icon: Sparkles, badge: 'Faz 3' },
    { to: '/reading', label: 'Reading', icon: BookMarked, badge: 'Faz 4' },
    { to: '/skills', label: 'Skills', icon: BrainCircuit, badge: 'Faz 5' },
  ];

  const secondaryLinks = [
    { to: '/review', label: 'Tekrar Havuzu', icon: RotateCcw },
    { to: '/progress', label: 'İlerleme & Analitik', icon: BarChart3 },
    { to: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card lg:z-30">
      {/* Brand & Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground block leading-tight">
              English Camp
            </span>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
              YDS • YÖKDİL • YDT
            </span>
          </div>
        </NavLink>
      </div>

      {/* Camp Summary Widget */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-muted/60 border border-border/60">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
          <span>Genel Kamp İlerlemesi</span>
          <span className="font-bold text-foreground">%{overall.overallPercentage}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${overall.overallPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
          <span>{overall.completedDaysCount} / {overall.totalDaysCount} Gün</span>
          <span>{overall.completedRequiredTasks} / {overall.totalRequiredTasks} Zorunlu Görev</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Main */}
        <div>
          <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Ana Akış
          </div>
          <nav className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Modules */}
        <div>
          <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Öğrenme Modülleri
          </div>
          <nav className="space-y-1">
            {moduleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold dark:bg-primary/25">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Support */}
        <div>
          <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Kayıtlar & Tercihler
          </div>
          <nav className="space-y-1">
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer & Controls */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Temayı Değiştir"
        >
          <div className="flex items-center gap-3">
            {effectiveTheme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
            <span>Tema</span>
          </div>
          <span className="text-xs capitalize font-normal text-muted-foreground">
            {effectiveTheme === 'dark' ? 'Koyu' : 'Açık'}
          </span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-muted-foreground">
          <HardDrive className="h-3 w-3 text-emerald-500" />
          <span>Yerel IndexedDB Aktif</span>
        </div>
      </div>
    </aside>
  );
};
