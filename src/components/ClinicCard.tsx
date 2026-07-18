import type { Clinic, TreatmentType } from '../lib/types';
import { TREATMENT_INFO, TREATMENT_ORDER } from '../lib/treatments';
import { provenanceLabel, resolveProvenance } from '../lib/clinicProvenance';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { Button } from './ui/button';

type CostRow = {
  type: TreatmentType;
  amount: number;
};

function costRows(clinic: Clinic): CostRow[] {
  const cost = clinic.approximateCost;
  if (!cost) return [];

  const rows: CostRow[] = [
    { type: 'ivf', amount: cost.ivf },
    { type: 'icsi', amount: cost.icsi },
  ];
  if (cost.eggDonation != null) {
    rows.push({ type: 'egg-donation', amount: cost.eggDonation });
  }
  if (cost.spermDonation != null) {
    rows.push({ type: 'sperm-donation', amount: cost.spermDonation });
  }
  return rows;
}

function formatEuro(amount: number): string {
  return `~${amount.toLocaleString('de-DE')} €`;
}

function sortedSpecialties(specialties: TreatmentType[]): TreatmentType[] {
  return TREATMENT_ORDER.filter((type) => specialties.includes(type));
}

export function ClinicCard({ clinic, standLabel }: { clinic: Clinic; standLabel?: string }) {
  const specialties = sortedSpecialties(clinic.specialties);
  const rows = costRows(clinic);
  const fromPrice = rows.length ? Math.min(...rows.map((row) => row.amount)) : null;
  const location = [clinic.city, clinic.countryCode].filter(Boolean).join(' · ');
  const provenance = resolveProvenance(clinic);
  const isCurated = provenance === 'curated';

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-soft transition-geist hover:border-border hover:shadow-card">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-stretch lg:gap-8">
        {/* Identity */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <h2 className="text-fluid-lg font-semibold leading-snug tracking-tight text-foreground">
                {clinic.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-fluid-sm text-muted-foreground">
                {location && (
                  <span className="inline-flex items-center gap-1.5 text-foreground/75">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                    {location}
                  </span>
                )}
                <span
                  className={
                    isCurated
                      ? 'rounded-md bg-primary/10 px-2 py-0.5 text-fluid-xs font-medium text-primary'
                      : 'rounded-md bg-secondary px-2 py-0.5 text-fluid-xs font-medium text-foreground/75'
                  }
                >
                  {provenanceLabel(provenance)}
                </span>
                {standLabel && (
                  <>
                    <span className="text-border" aria-hidden>
                      ·
                    </span>
                    <span className="text-fluid-xs">Stand {standLabel}</span>
                  </>
                )}
                {clinic.stale && (
                  <span className="badge-warning rounded-md px-2 py-0.5 text-fluid-xs font-medium">
                    Daten veraltet
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              {clinic.rating != null ? (
                <div
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/90 px-2.5 py-1"
                  aria-label={`Bewertung ${clinic.rating} von 5`}
                >
                  <Star
                    className="h-3.5 w-3.5 fill-amber-500/90 text-amber-500/90"
                    aria-hidden
                  />
                  <span className="data-geist text-fluid-sm font-medium text-foreground">
                    {clinic.rating}
                  </span>
                </div>
              ) : (
                <span className="text-fluid-xs text-muted-foreground">Keine Bewertung</span>
              )}
            </div>
          </div>

          {clinic.description && (
            <p className="line-clamp-2 max-w-2xl text-fluid-sm leading-relaxed text-muted-foreground">
              {clinic.description}
            </p>
          )}

          {specialties.length > 0 && (
            <ul className="flex list-none flex-wrap gap-1.5 p-0" aria-label="Behandlungen">
              {specialties.map((type) => {
                const info = TREATMENT_INFO[type];
                return (
                  <li key={type}>
                    <span
                      title={info.description}
                      className="inline-flex rounded-md bg-secondary px-2 py-1 text-fluid-xs font-medium text-foreground/85"
                    >
                      {info.shortLabel}
                      <span className="sr-only"> — {info.methodName}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Decision aids: price + action */}
        <div className="flex shrink-0 flex-col justify-between gap-4 border-t border-border/60 pt-4 lg:w-56 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="space-y-3">
            {fromPrice != null ? (
              <>
                <div>
                  <p className="label-geist text-muted-foreground">Kosten ab</p>
                  <p className="data-geist mt-1 text-fluid-xl font-semibold tracking-tight text-foreground">
                    {formatEuro(fromPrice)}
                  </p>
                </div>
                <dl className="space-y-1.5">
                  {rows.map((row) => {
                    const info = TREATMENT_INFO[row.type];
                    return (
                      <div
                        key={row.type}
                        className="flex items-baseline justify-between gap-3 text-fluid-xs"
                      >
                        <dt className="text-muted-foreground" title={info.methodName}>
                          {info.shortLabel}
                        </dt>
                        <dd className="data-geist font-medium text-foreground/90">
                          {formatEuro(row.amount)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <p className="text-fluid-xs text-muted-foreground/80">Richtwerte · ohne Gewähr</p>
              </>
            ) : (
              <div>
                <p className="label-geist text-muted-foreground">Kosten</p>
                <p className="mt-1 text-fluid-sm text-muted-foreground">Keine Angabe</p>
              </div>
            )}
          </div>

          <Button asChild variant="default" size="default" className="w-full min-h-11">
            <a href={clinic.website} target="_blank" rel="noopener noreferrer">
              Website besuchen
              <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
