import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void; }

const stored = (localStorage.getItem('theme') as Theme) || 'light';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored,
  toggle: () => set((s) => {
    const next = s.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    return { theme: next };
  }),
  setTheme: (t) => {
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    set({ theme: t });
  },
}));

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', stored);
  document.documentElement.classList.toggle('dark', stored === 'dark');
}
