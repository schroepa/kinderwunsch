import type { Clinic, TreatmentType } from './types';

export type ClinicRankResult = {
  clinics: Clinic[];
  usedTreatmentFallback: boolean;
};

function overlapCount(clinic: Clinic, treatments: TreatmentType[]): number {
  const set = new Set(clinic.specialties);
  return treatments.reduce((n, t) => n + (set.has(t) ? 1 : 0), 0);
}

function costKey(clinic: Clinic, treatments: TreatmentType[]): number {
  const cost = clinic.approximateCost;
  if (!cost) return Number.POSITIVE_INFINITY;
  if (treatments.includes('icsi') && typeof cost.icsi === 'number') return cost.icsi;
  if (typeof cost.ivf === 'number') return cost.ivf;
  return Number.POSITIVE_INFINITY;
}

export function filterAndSortClinics(
  clinics: Clinic[],
  countryId: string,
  treatments: TreatmentType[],
): ClinicRankResult {
  const inCountry = clinics.filter((c) => c.country === countryId);
  if (inCountry.length === 0) {
    return { clinics: [], usedTreatmentFallback: false };
  }

  const matched = inCountry.filter((c) => overlapCount(c, treatments) > 0);
  const usedTreatmentFallback = matched.length === 0;
  const pool = usedTreatmentFallback ? inCountry : matched;

  const sorted = [...pool].sort((a, b) => {
    const o = overlapCount(b, treatments) - overlapCount(a, treatments);
    if (o !== 0) return o;
    const c = costKey(a, treatments) - costKey(b, treatments);
    if (c !== 0) return c;
    return a.name.localeCompare(b.name, 'de');
  });

  return { clinics: sorted, usedTreatmentFallback };
}
