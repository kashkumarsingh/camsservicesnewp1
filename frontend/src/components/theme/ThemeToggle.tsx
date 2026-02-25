'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const label =
    theme === 'system'
      ? `Theme: system (${resolvedTheme})`
      : `Theme: ${theme}`;

  const baseClasses =
    'inline-flex items-center justify-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-colors';
  const defaultClasses =
    'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white';

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={className ? `${baseClasses} ${className}` : `${baseClasses} ${defaultClasses}`}
      aria-label={label}
      title={label}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
