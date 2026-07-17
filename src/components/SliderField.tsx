import { Minus, Plus } from 'lucide-react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';

type SliderFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Visible formatted value next to the label (not under the finger). */
  formatValue: (value: number) => string;
  ariaValueText: string;
  minLabel: string;
  maxLabel: string;
  hint?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Mobile-first numeric control: steppers for precision + slider for coarse adjustment.
 * Value readout sits beside the label so it never hides under a thumb.
 */
export function SliderField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  ariaValueText,
  minLabel,
  maxLabel,
  hint,
}: SliderFieldProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const stepBy = (direction: -1 | 1) => {
    const next = clamp(value + direction * step, min, max);
    // Keep budget-style steps aligned to the step grid
    const aligned = Math.round(next / step) * step;
    onChange(clamp(aligned, min, max));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-fluid-sm">
          {label}
        </Label>
        <output
          htmlFor={id}
          className="data-geist text-fluid-lg font-semibold tabular-nums tracking-tight text-foreground"
          aria-live="polite"
        >
          {formatValue(value)}
        </output>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => stepBy(-1)}
          disabled={atMin}
          aria-label={`${label} verringern`}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </Button>

        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={(next) => onChange(next[0])}
          aria-valuetext={ariaValueText}
          className="min-w-0 flex-1"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => stepBy(1)}
          disabled={atMax}
          aria-label={`${label} erhöhen`}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="flex justify-between px-0.5 text-fluid-xs text-muted-foreground">
        <span className="data-geist">{minLabel}</span>
        <span className="data-geist">{maxLabel}</span>
      </div>

      {hint && <p className="text-fluid-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
