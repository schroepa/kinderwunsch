import type { Clinic } from '../lib/types';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { AnimatedIcon } from './icons/AnimatedIcon';

export function ClinicCard({ clinic, standLabel }: { clinic: Clinic; standLabel?: string }) {
  return (
    <div className="surface-muted space-y-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-fluid-base font-semibold leading-snug">{clinic.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-fluid-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {clinic.city}
            </span>
            {standLabel && <span>Stand: {standLabel}</span>}
            {clinic.stale && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-warning-foreground">
                Daten veraltet
              </span>
            )}
          </div>
        </div>
        <div className="data-geist flex shrink-0 items-center gap-1 text-fluid-sm text-foreground">
          {clinic.rating != null ? (
            <>
              <Star className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <span>{clinic.rating}</span>
            </>
          ) : (
            <span className="text-muted-foreground">k. A.</span>
          )}
        </div>
      </div>

      {clinic.description && (
        <p className="line-clamp-3 text-fluid-xs leading-relaxed text-muted-foreground">{clinic.description}</p>
      )}

      {clinic.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {clinic.specialties.map((s) => (
            <span
              key={s}
              className="rounded-md border border-border/60 bg-secondary px-2 py-0.5 text-fluid-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {clinic.approximateCost ? (
        <div className="data-geist text-fluid-xs text-muted-foreground">
          IVF: ~{clinic.approximateCost.ivf.toLocaleString('de-DE')} € · ICSI: ~
          {clinic.approximateCost.icsi.toLocaleString('de-DE')} €
        </div>
      ) : (
        <div className="text-fluid-xs text-muted-foreground">Kosten: k. A.</div>
      )}

      <a
        href={clinic.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-fluid-xs font-medium text-primary transition-colors hover:text-primary/80"
      >
        <AnimatedIcon icon={ExternalLink} size={14} />
        Website besuchen
      </a>
    </div>
  );
}
