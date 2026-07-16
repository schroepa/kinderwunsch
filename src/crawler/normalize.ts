import type { Clinic, RawClinic } from './types';
import { toCountrySlug } from './countryMap';

function slugifyId(name: string, countryCode: string, city: string): string {
  const base = `${countryCode}-${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base.slice(0, 80);
}

export function normalizeWebsite(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url.trim());
    u.hash = '';
    let path = u.pathname.replace(/\/+$/, '');
    if (path === '/') path = '';
    const hostname = u.hostname.toLowerCase().replace(/^www\./, '');
    return `https://${hostname}${path}`;
  } catch {
    return undefined;
  }
}

export function normalizeRawClinic(raw: RawClinic, updatedAt = new Date().toISOString()): Clinic {
  const countryCode = raw.countryCode.trim().toUpperCase();
  const website =
    normalizeWebsite(raw.website) ??
    `https://unknown.invalid/${slugifyId(raw.name, countryCode, raw.city)}`;
  return {
    id: slugifyId(raw.name, countryCode, raw.city),
    name: raw.name.trim(),
    country: toCountrySlug(countryCode),
    countryCode,
    city: raw.city.trim(),
    website,
    specialties: raw.specialties ?? [],
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    updatedAt,
    rating: raw.rating,
    approximateCost: raw.approximateCost,
    description: raw.description?.trim() || undefined,
    languages: raw.languages,
  };
}
