'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl border border-argus-200 dark:border-slate-800 bg-argus-100 dark:bg-slate-800" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border transition-all flex items-center justify-center bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-200 border-argus-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand-border"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-700" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
