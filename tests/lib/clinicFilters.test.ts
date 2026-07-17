import { describe, expect, it } from 'vitest';
import { clinicReferenceCost, matchesClinicFilters } from '../../src/lib/clinicFilters';
import type { Clinic } from '../../src/lib/types';

function clinic(partial: Partial<Clinic> & Pick<Clinic, 'id' | 'name'>): Clinic {
  return {
    country: 'germany',
    city: 'Berlin',
    website: 'https://example.com',
    specialties: ['ivf', 'icsi'],
    countryCode: 'DE',
    source: 'directory',
    sourceUrl: 'seed',
    updatedAt: '2026-07-17T00:00:00.000Z',
    approximateCost: { ivf: 3500, icsi: 4500 },
    ...partial,
  };
}

describe('clinicFilters', () => {
  it('filters by country and treatment specialty', () => {
    const set = [
      clinic({ id: '1', name: 'DE', countryCode: 'DE', specialties: ['ivf'] }),
      clinic({ id: '2', name: 'ES', countryCode: 'ES', specialties: ['egg-donation'], country: 'spain' }),
    ];
    const matches = set.filter((c) =>
      matchesClinicFilters(c, {
        country: 'ES',
        treatment: 'egg-donation',
        maxPrice: null,
        query: '',
      }),
    );
    expect(matches.map((c) => c.id)).toEqual(['2']);
  });

  it('filters by max price using IVF when treatment is ivf', () => {
    const expensive = clinic({
      id: 'x',
      name: 'X',
      approximateCost: { ivf: 9000, icsi: 9500 },
    });
    expect(
      matchesClinicFilters(expensive, {
        country: 'all',
        treatment: 'ivf',
        maxPrice: 5000,
        query: '',
      }),
    ).toBe(false);
    expect(
      matchesClinicFilters(expensive, {
        country: 'all',
        treatment: 'ivf',
        maxPrice: 10000,
        query: '',
      }),
    ).toBe(true);
  });

  it('excludes clinics without cost when price filter is set', () => {
    const noCost = clinic({ id: 'n', name: 'N', approximateCost: undefined });
    expect(
      matchesClinicFilters(noCost, {
        country: 'all',
        treatment: 'all',
        maxPrice: 5000,
        query: '',
      }),
    ).toBe(false);
  });

  it('uses cheapest listed cost when treatment is all', () => {
    expect(
      clinicReferenceCost(
        clinic({
          id: '1',
          name: 'A',
          approximateCost: { ivf: 5000, icsi: 3000, eggDonation: 8000 },
        }),
        'all',
      ),
    ).toBe(3000);
  });
});
