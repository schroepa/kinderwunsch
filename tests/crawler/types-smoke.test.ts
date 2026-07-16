import { describe, it, expect } from 'vitest';
import type { Clinic, ClinicsApiResponse } from '../../src/lib/types';

describe('Clinic type contract', () => {
  it('allows clinics without rating or cost', () => {
    const clinic: Clinic = {
      id: 'es-demo',
      name: 'Demo Clinic',
      country: 'spain',
      countryCode: 'ES',
      city: 'Barcelona',
      website: 'https://example.com',
      specialties: ['ivf'],
      source: 'directory',
      sourceUrl: 'https://example.com/list',
      updatedAt: '2026-07-16T00:00:00.000Z',
    };
    expect(clinic.rating).toBeUndefined();
    expect(clinic.approximateCost).toBeUndefined();
  });

  it('defines API response shape', () => {
    const res: ClinicsApiResponse = {
      clinics: [],
      meta: {
        lastCrawledAt: null,
        lastPartialAt: null,
        clinicCount: 0,
        refreshing: false,
        stats: { directory: 0, association: 0, clinic_site: 0, errors: 0 },
        cursor: 0,
      },
    };
    expect(res.meta.clinicCount).toBe(0);
  });
});
