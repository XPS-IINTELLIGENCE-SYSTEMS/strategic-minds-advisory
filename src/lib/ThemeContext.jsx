import React, { createContext, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'strategic-minds-theme-mode';
const validModes = new Set(['light', 'dark', 'system']);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode) {
  const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = resolvedTheme;
  return resolvedTheme;
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const initialMode = validModes.has(saved) ? saved : 'system';
    setThemeModeState(initialMode);
    setResolvedTheme(applyTheme(initialMode));
  }, []);

  useEffect(() => {
    if (themeMode !== 'system') return undefined;

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;

    const handleChange = () => setResolvedTheme(applyTheme('system'));
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, [themeMode]);

  const setThemeMode = (mode) => {
    const nextMode = validModes.has(mode) ? mode : 'system';
    setThemeModeState(nextMode);
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    setResolvedTheme(applyTheme(nextMode));
  };

  const toggleTheme = () => {
    setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(() => ({
    theme: resolvedTheme,
    resolvedTheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  }), [resolvedTheme, themeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
