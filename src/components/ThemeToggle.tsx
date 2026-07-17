import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, getResolvedTheme, setTheme, type Theme } from '@/lib/theme';
import { Button } from './ui/button';
import { AnimatedIcon } from './icons/AnimatedIcon';

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const resolved = getResolvedTheme();
    applyTheme(resolved);
    setThemeState(resolved);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6"
        aria-label="Design umschalten"
        disabled
      >
        <Sun className="h-5 w-5 opacity-0" aria-hidden />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed right-4 top-4 z-50 shadow-card sm:right-6 sm:top-6"
      onClick={handleToggle}
      aria-label={isDark ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
    >
      {isDark ? (
        <AnimatedIcon icon={Sun} size={18} />
      ) : (
        <AnimatedIcon icon={Moon} size={18} />
      )}
    </Button>
  );
}
