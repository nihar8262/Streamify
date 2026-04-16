import React from 'react';
import { MoonStar, SunMedium } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';

const DarkMode = ({ compact = false, iconOnly = false }) => {
  const { theme, toggleTheme } = useAppContext();
  const isDarkMode = theme === 'dark';
  const shouldShowLabel = !compact && !iconOnly;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative inline-flex h-11 items-center overflow-hidden rounded-full border border-white/10 bg-slate-950 text-sm font-medium text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:bg-slate-900 active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/15 ${compact ? 'w-full justify-center px-0' : iconOnly ? 'w-10 justify-center px-0' : 'gap-2 px-4'}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-accent/30 via-transparent to-accent/20 opacity-0 transition duration-300 group-hover:opacity-100" />
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
        {isDarkMode ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </span>
      {shouldShowLabel && <span className="relative hidden sm:inline">{isDarkMode ? 'Dark' : 'Light'}</span>}
    </button>
  );
};

export default DarkMode;
