import type { Clinic } from './types';
import { normalizeWebsite } from './normalize';

function fallbackKey(c: Clinic): string {
  return `${c.name.toLowerCase()}|${c.city.toLowerCase()}|${c.countryCode}`;
}

function websiteKey(c: Clinic): string | null {
  const n = normalizeWebsite(c.website);
  if (!n || n.includes('unknown.invalid')) return null;
  return n;
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
    byKey.set(key, {
      ...existing,
      ...clinic,
      specialties: Array.from(new Set([...existing.specialties, ...clinic.specialties])),
      languages: Array.from(
        new Set([...(existing.languages ?? []), ...(clinic.languages ?? [])]),
      ),
      description: clinic.description ?? existing.description,
      rating: clinic.rating ?? existing.rating,
      approximateCost: clinic.approximateCost ?? existing.approximateCost,
      stale: clinic.stale ?? existing.stale,
      updatedAt: clinic.updatedAt > existing.updatedAt ? clinic.updatedAt : existing.updatedAt,
      source: clinic.source === 'clinic_site' ? 'clinic_site' : existing.source,
    });
  }

  return Array.from(byKey.values());
}
