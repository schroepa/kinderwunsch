import { cn } from '@/lib/utils';
import type { TreatmentType } from '@/lib/types';
import { Check } from 'lucide-react';

const LABELS: Record<TreatmentType, string> = {
  ivf: 'IVF (Standard)',
  icsi: 'ICSI',
  'egg-donation': 'Eizellspende',
  'sperm-donation': 'Samenspende',
  pgd: 'PID (Präimplantationsdiagnostik)',
};

export function TreatmentToggle({
  treatment,
  label,
  checked,
  onChange,
}: {
  treatment: TreatmentType;
  label?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'flex min-h-9 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-fluid-sm transition-geist',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked
          ? 'border-primary/30 bg-primary/8 text-foreground shadow-soft'
          : 'border-border/60 bg-background text-foreground/80 shadow-inset hover:bg-accent',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-geist',
          checked
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border/60 bg-background text-transparent',
        )}
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="leading-snug">{label ?? LABELS[treatment]}</span>
    </button>
  );
}
