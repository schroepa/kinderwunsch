import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  /** Shows a live value bubble above the thumb (AA-friendly, always visible). */
  formatValue?: (value: number) => string;
};

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, formatValue, value, defaultValue, min = 0, max = 100, ...props }, ref) => {
    const values = value ?? defaultValue ?? [min];
    const current = values[0] ?? min;

    return (
      <SliderPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          formatValue ? 'pt-9 pb-2' : 'py-2',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'relative block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-soft transition-geist',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {formatValue && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2',
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
