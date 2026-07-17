import { cn } from '@/lib/utils';

type RoserLogoSize = 'sm' | 'md' | 'lg' | 'hero';

const markSize: Record<RoserLogoSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
  hero: 'h-12 w-12 sm:h-14 sm:w-14',
};

const wordSize: Record<RoserLogoSize, string> = {
  sm: 'text-[0.9375rem] font-semibold tracking-[-0.03em]',
  md: 'text-fluid-lg font-semibold tracking-[-0.035em]',
  lg: 'text-fluid-xl font-semibold tracking-[-0.04em]',
  hero: 'brand-wordmark',
};

/** Shared rosebud path — solid mass + one fold cutout (evenodd). */
export const ROSER_MARK_PATH =
  'M16 3c6.2 0 11.2 5.2 11.2 12.2 0 6.1-4.2 11.1-9.5 14-.9.5-2 .5-2.9 0-5.3-2.9-9.5-7.9-9.5-14C5.3 8.2 10.3 3 16 3Zm-2.2 6.2c-2.6 2.8-2.8 7.2-.2 10.2.4.5 1.2.5 1.6 0 .4-.4.4-1.1 0-1.5-1.8-2.2-1.7-5.4.3-7.4.4-.5.4-1.2 0-1.6-.5-.4-1.2-.3-1.7.3Z';

/**
 * Roser mark — rosebud silhouette with a single inner fold.
 * Optimized for small sizes (favicon / nav): solid mass, no hairlines.
 */
export function RoserMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={cn('shrink-0 text-primary', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path fill="currentColor" fillRule="evenodd" d={ROSER_MARK_PATH} />
    </svg>
  );
}

/**
 * Roser lockup: mark + Geist Sans wordmark.
 * Wordmark stays live type (never outlined) so weight/tracking match the product UI.
 */
export function RoserLogo({
  size = 'md',
  markOnly = false,
  className,
  markClassName,
  wordmarkClassName,
}: {
  size?: RoserLogoSize;
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  if (markOnly) {
    return <RoserMark className={cn(markSize[size], markClassName)} title="Roser" />;
  }

  const isHero = size === 'hero';

  return (
    <span
      className={cn(
        'inline-flex min-w-0 items-center text-foreground',
        isHero ? 'flex-col items-start gap-4 sm:gap-5' : 'gap-2',
        className,
      )}
    >
      <RoserMark className={cn(markSize[size], markClassName)} />
      <span
        className={cn(
          'font-sans leading-none text-foreground',
          wordSize[size],
          wordmarkClassName,
        )}
      >
        Roser
      </span>
    </span>
  );
}
