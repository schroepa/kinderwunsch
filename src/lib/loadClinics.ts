import type { ClinicsApiResponse } from './types';

const CHECKED_KEY = 'clinicsCheckedAt';
const SESSION_KEY = 'clinicsSessionLoaded';
const DAY_MS = 24 * 60 * 60 * 1000;

export async function loadClinics(options?: { force?: boolean }): Promise<ClinicsApiResponse> {
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && typeof localStorage !== 'undefined') {
    const checked = Number(localStorage.getItem(CHECKED_KEY) ?? '0');
    if (checked && now - checked < DAY_MS) {
      const cached = sessionStorage.getItem('clinicsPayload');
      if (cached) return JSON.parse(cached) as ClinicsApiResponse;
    }
  }

  const res = await fetch('/api/clinics');
  if (!res.ok) {
    const fallback = await fetch('/data/clinics.json');
    const clinics = await fallback.json();
    return {
      clinics,
      meta: {
        lastCrawledAt: null,
        lastPartialAt: null,
        clinicCount: clinics.length,
        refreshing: false,
        stats: { directory: 0, association: 0, clinic_site: 0, errors: 0 },
        cursor: 0,
      },
    };
  }

  const data = (await res.json()) as ClinicsApiResponse;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CHECKED_KEY, String(now));
    sessionStorage.setItem('clinicsPayload', JSON.stringify(data));
    sessionStorage.setItem(SESSION_KEY, '1');
  }
  return data;
}

export function shouldPrefetchOnMount(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(SESSION_KEY) !== '1';
}
