import React from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

export const Header: React.FC = () => {
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-4 lg:hidden">
      <NavLink to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="font-bold text-sm tracking-tight text-foreground">
          English Camp
        </span>
      </NavLink>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Temayı Değiştir"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"
        >
          {effectiveTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-primary" />
          )}
        </button>
      </div>
    </header>
  );
};
