import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Bugün', icon: LayoutDashboard },
    { to: '/camp', label: 'Kamp', icon: CalendarDays },
    { to: '/grammar', label: 'Modüller', icon: BookOpen },
    { to: '/progress', label: 'İlerleme', icon: BarChart3 },
    { to: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
