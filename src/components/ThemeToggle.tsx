import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { applyTheme, getResolvedTheme, setTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

type ThemeToggleVariant = 'fixed' | 'inline';

const variantClasses: Record<ThemeToggleVariant, string> = {
  fixed: 'fixed right-4 top-4 z-50 sm:right-6 sm:top-6',
  inline: 'shrink-0',
};

/** Thumb travel: track 60px − padding 8px − thumb 28px = 24px */
const THUMB_TRAVEL = 24;

const spring = { type: 'spring' as const, stiffness: 420, damping: 28 };

export function ThemeToggle({ variant = 'fixed' }: { variant?: ThemeToggleVariant }) {
  const className = variantClasses[variant];
  const reduceMotion = useReducedMotion();
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

  const isDark = theme === 'dark';
  const transition = reduceMotion ? { duration: 0 } : spring;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted ? isDark : undefined}
      aria-label={
        !mounted
          ? 'Design umschalten'
          : isDark
            ? 'Hellmodus aktivieren'
            : 'Dunkelmodus aktivieren'
      }
      disabled={!mounted}
      onClick={handleToggle}
      className={cn(
        'group relative inline-flex h-9 w-[3.75rem] shrink-0 items-center rounded-full border border-border/70 p-1',
        'bg-secondary/90 shadow-soft transition-geist',
        'hover:border-border hover:bg-secondary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-between px-2.5"
        aria-hidden
      >
        <motion.span
          className="inline-flex text-amber-600 dark:text-amber-400"
          animate={
            reduceMotion
              ? { opacity: isDark ? 0.3 : 1 }
              : {
                  opacity: isDark ? 0.28 : 1,
                  scale: isDark ? 0.7 : 1,
                  rotate: isDark ? -40 : 0,
                }
          }
          transition={transition}
        >
          <Sun size={14} strokeWidth={2.25} />
        </motion.span>
        <motion.span
          className="inline-flex text-sky-700 dark:text-sky-300"
          animate={
            reduceMotion
              ? { opacity: isDark ? 1 : 0.3 }
              : {
                  opacity: isDark ? 1 : 0.28,
                  scale: isDark ? 1 : 0.7,
                  rotate: isDark ? 0 : 40,
                }
          }
          transition={transition}
        >
          <Moon size={14} strokeWidth={2.25} />
        </motion.span>
      </span>

      <motion.span
        aria-hidden
        className="relative z-10 block h-7 w-7 rounded-full border border-border/40 bg-card shadow-card"
        animate={{ x: isDark ? THUMB_TRAVEL : 0 }}
        transition={transition}
        initial={false}
      >
        <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
          <motion.span
            className="absolute inline-flex text-amber-600 dark:text-amber-400"
            animate={
              reduceMotion
                ? { opacity: isDark ? 0 : 1 }
                : {
                    opacity: isDark ? 0 : 1,
                    scale: isDark ? 0.35 : 1,
                    rotate: isDark ? -90 : 0,
                    y: isDark ? 10 : 0,
                  }
            }
            transition={transition}
          >
            <Sun size={13} strokeWidth={2.4} />
          </motion.span>
          <motion.span
            className="absolute inline-flex text-sky-700 dark:text-sky-300"
            animate={
              reduceMotion
                ? { opacity: isDark ? 1 : 0 }
                : {
                    opacity: isDark ? 1 : 0,
                    scale: isDark ? 1 : 0.35,
                    rotate: isDark ? 0 : 90,
                    y: isDark ? 0 : -10,
                  }
            }
            transition={transition}
          >
            <Moon size={13} strokeWidth={2.4} />
          </motion.span>
        </span>
      </motion.span>
    </button>
  );
}
