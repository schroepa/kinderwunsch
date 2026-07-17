export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'roser-theme';
const LEGACY_STORAGE_KEY = 'kinderwunsch-theme';

const THEME_COLORS: Record<Theme, string> = {
  light: '#f4f8fa',
  dark: '#0b1114',
};

export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  const value = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getResolvedTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getResolvedTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
