import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  /** Optional live value bubble above the thumb (prefer a separate value readout on mobile). */
  formatValue?: (value: number) => string;
  showValueBubble?: boolean;
};

/**
 * Touch-friendly slider:
 * - ≥44×44px thumb hit target (WCAG 2.5.5 / Apple HIG)
 * - thicker track + vertical padding so the whole control is easy to grab
 * - `touch-none` keeps drag from scrolling the page while adjusting
 */
const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      formatValue,
      showValueBubble = false,
      value,
      defaultValue,
      min = 0,
      max = 100,
      ...props
    },
    ref,
  ) => {
    const values = value ?? defaultValue ?? [min];
    const current = values[0] ?? min;
    const showBubble = Boolean(formatValue && showValueBubble);

    return (
      <SliderPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          // Tall hit area: padding expands the interactive region beyond the thin track
          showBubble ? 'pb-3 pt-10' : 'py-3',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary sm:h-1.5">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            // Visual knob ~24px; hit target forced to 44×44 via after-pseudo
            'relative block h-6 w-6 rounded-full border-2 border-primary bg-background shadow-card',
            'transition-geist',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:pointer-events-none disabled:opacity-50',
            'after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[""]',
            'active:scale-110',
          )}
        >
          {showBubble && formatValue && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 -translate-x-1/2',
                'max-w-[min(100vw-2rem,12rem)] truncate rounded-md bg-primary px-2 py-1',
                'data-geist text-fluid-xs font-medium text-primary-foreground shadow-soft',
              )}
            >
              {formatValue(current)}
              <span
                className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-primary"
                aria-hidden
              />
            </span>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
