'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type ThemeName = 'light' | 'dark';
type ThemeTokens = Record<string, string>;

const DARK_THEME: ThemeTokens = {
  bg: '#0B0B0C',
  bg2: '#131315',
  bg3: '#1A1A1D',
  line: '#2A2A2E',
  lineStrong: '#3A3A40',
  fg: '#F4F1EA',
  fg2: '#B8B4AB',
  fg3: '#6E6A62',
  gold: '#C9A24B',
  gold2: '#E2B95A',
  goldSoft: 'rgba(201, 162, 75, 0.12)',
};

const LIGHT_THEME: ThemeTokens = {
  bg: '#FAFAF8',
  bg2: '#F0EEE9',
  bg3: '#E8E5DF',
  line: '#D4D0C8',
  lineStrong: '#B0ACA4',
  fg: '#1A1A1D',
  fg2: '#4A4640',
  fg3: '#7A766E',
  gold: '#B8912E',
  gold2: '#C9A24B',
  goldSoft: 'rgba(184, 145, 46, 0.10)',
};

function applyTheme(theme: ThemeTokens, name: ThemeName) {
  const r = document.documentElement;
  r.style.setProperty('--bg', theme.bg);
  r.style.setProperty('--bg-2', theme.bg2);
  r.style.setProperty('--bg-3', theme.bg3);
  r.style.setProperty('--line', theme.line);
  r.style.setProperty('--line-strong', theme.lineStrong);
  r.style.setProperty('--fg', theme.fg);
  r.style.setProperty('--fg-2', theme.fg2);
  r.style.setProperty('--fg-3', theme.fg3);
  r.style.setProperty('--gold', theme.gold);
  r.style.setProperty('--gold-2', theme.gold2);
  r.style.setProperty('--gold-soft', theme.goldSoft);
  r.setAttribute('data-theme', name);
}

type ThemeContextValue = {
  theme: ThemeName;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('ces-theme') as ThemeName | null) || 'light';
    setTheme(saved);
    applyTheme(saved === 'dark' ? DARK_THEME : LIGHT_THEME, saved);
  }, []);

  const toggleTheme = () => {
    const next: ThemeName = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('ces-theme', next);
    applyTheme(next === 'dark' ? DARK_THEME : LIGHT_THEME, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
