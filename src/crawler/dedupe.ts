import type { Clinic } from './types';
import { normalizeWebsite } from './normalize';

function fallbackKey(c: Clinic): string {
  return `${c.name.toLowerCase()}|${c.city.toLowerCase()}|${c.countryCode}`;
}

function websiteKey(c: Clinic): string | null {
  const n = normalizeWebsite(c.website);
  if (!n || n.includes('unknown.invalid')) return null;
  // Multi-branch brands share one host — keep city-distinct locations.
  return `${n}|${c.city.toLowerCase()}|${c.countryCode}`;
}

export function dedupeClinics(clinics: Clinic[]): Clinic[] {
  const byKey = new Map<string, Clinic>();

  for (const clinic of clinics) {
    const key = websiteKey(clinic) ?? fallbackKey(clinic);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, clinic);
      continue;
    }
    const curated = existing.provenance === 'curated' ? existing : clinic;
    const other = existing.provenance === 'curated' ? clinic : existing;
    byKey.set(key, {
      ...other,
      ...curated,
      specialties: Array.from(new Set([...existing.specialties, ...clinic.specialties])),
      languages: Array.from(
        new Set([...(existing.languages ?? []), ...(clinic.languages ?? [])]),
      ),
      description: curated.description ?? other.description,
      rating: curated.rating ?? other.rating,
      approximateCost: curated.approximateCost ?? other.approximateCost,
      stale: clinic.stale ?? existing.stale,
      updatedAt: clinic.updatedAt > existing.updatedAt ? clinic.updatedAt : existing.updatedAt,
      source: clinic.source === 'clinic_site' ? 'clinic_site' : existing.source,
      provenance:
        existing.provenance === 'curated' || clinic.provenance === 'curated'
          ? 'curated'
          : (clinic.provenance ?? existing.provenance),
    });
  }

  return Array.from(byKey.values());
}
