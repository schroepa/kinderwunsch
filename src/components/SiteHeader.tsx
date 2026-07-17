import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { RoserLogo } from './RoserLogo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

const NAV_LINKS = [
  { href: '/', label: 'Finder', hint: 'Länder & Kliniken finden' },
  { href: '/kliniken', label: 'Kliniken', hint: 'EU-Klinikverzeichnis' },
  { href: '/wissen', label: 'Wissen', hint: 'Guides & Hintergründe' },
] as const;

function isCurrentPath(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function SiteHeader({
  currentPath,
  showThemeToggle = true,
}: {
  currentPath: string;
  showThemeToggle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:min-h-16 sm:px-6 lg:px-8">
        <a
          href="/"
          className="group min-w-0 shrink rounded-lg transition-geist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Roser — Startseite"
        >
          <RoserLogo
            size="sm"
            className="text-foreground transition-geist group-hover:text-primary"
            markClassName="transition-geist group-hover:text-primary"
            wordmarkClassName="transition-geist group-hover:text-primary"
          />
        </a>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const current = isCurrentPath(link.href, currentPath);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  className={[
                    'rounded-lg px-3 py-2 text-fluid-sm font-medium transition-geist',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    current
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                  ].join(' ')}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {showThemeToggle && <ThemeToggle variant="inline" />}

          <Button
            ref={toggleRef}
            type="button"
            variant="secondary"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </Button>
        </div>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className="border-t border-border/60 bg-background/95 md:hidden"
      >
        <nav aria-label="Mobile Navigation" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ul className="flex list-none flex-col gap-1 p-0">
            {NAV_LINKS.map((link) => {
              const current = isCurrentPath(link.href, currentPath);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={current ? 'page' : undefined}
                    className={[
                      'flex min-h-12 flex-col justify-center rounded-xl px-3.5 py-2.5 transition-geist',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      current
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent',
                    ].join(' ')}
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-fluid-base font-medium">{link.label}</span>
                    <span className="text-fluid-xs text-muted-foreground">{link.hint}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
