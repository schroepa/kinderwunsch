import { useId, type KeyboardEvent, type MouseEvent } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreatmentType } from '@/lib/types';
import { TREATMENT_INFO } from '@/lib/treatments';
import { treatmentGuidePath } from '@/lib/wissen';

export function TreatmentToggle({
  treatment,
  label,
  description,
  checked,
  onChange,
}: {
  treatment: TreatmentType;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  const reactId = useId();
  const descId = `${reactId}-desc`;
  const info = TREATMENT_INFO[treatment];
  const title = label ?? info.label;
  const hint = description ?? info.description;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange();
    }
  };

  const stopToggle = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={title}
      aria-describedby={descId}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-geist',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked
          ? 'border-primary/30 bg-primary/8 text-foreground shadow-soft'
          : 'border-border/60 bg-background text-foreground shadow-inset hover:bg-accent',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-geist',
          checked
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border/60 bg-background text-transparent',
        )}
        aria-hidden
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block text-fluid-sm font-medium leading-snug">{title}</span>
        <span id={descId} className="block text-fluid-xs leading-relaxed text-muted-foreground">
          {hint}{' '}
          <a
            href={treatmentGuidePath(treatment)}
            onClick={stopToggle}
            className="font-medium text-primary hover:underline"
          >
            Mehr erfahren
          </a>
        </span>
      </span>
    </div>
  );
}
