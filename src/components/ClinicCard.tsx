import type { Clinic } from '../lib/types';

export function ClinicCard({ clinic, standLabel }: { clinic: Clinic; standLabel?: string }) {
  return (
    <div className="bg-muted/50 p-3 rounded-md space-y-1">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium">{clinic.name}</div>
          <div className="text-sm text-muted-foreground">
            {clinic.city}
            {standLabel ? ` · Stand: ${standLabel}` : ''}
            {clinic.stale ? ' · Daten veraltet' : ''}
          </div>
        </div>
        <div className="text-sm font-semibold text-primary">
          {clinic.rating != null ? `⭐ ${clinic.rating}` : 'k. A.'}
        </div>
      </div>
      {clinic.description && <p className="text-xs text-muted-foreground">{clinic.description}</p>}
      {clinic.specialties.length > 0 && (
        <div className="text-xs text-muted-foreground">{clinic.specialties.join(', ')}</div>
      )}
      {clinic.approximateCost ? (
        <div className="text-xs text-muted-foreground">
          IVF: ~{clinic.approximateCost.ivf.toLocaleString('de-DE')} € | ICSI: ~
          {clinic.approximateCost.icsi.toLocaleString('de-DE')} €
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">Kosten: k. A.</div>
      )}
      <a
        href={clinic.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Website besuchen →
      </a>
    </div>
  );
}
