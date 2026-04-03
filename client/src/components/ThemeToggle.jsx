import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative z-[100] flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 border-2 shadow-lg hover:scale-105 active:scale-95
        ${isDark 
          ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:border-yellow-400/50' 
          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
        }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <>
          <Sun size={18} strokeWidth={2.5} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Light</span>
        </>
      ) : (
        <>
          <Moon size={18} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
