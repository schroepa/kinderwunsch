import { describe, expect, it } from 'vitest';
import { filterAndSortClinics } from '../../src/lib/clinicRanking';
import type { Clinic } from '../../src/lib/types';

function clinic(partial: Partial<Clinic> & Pick<Clinic, 'id' | 'name' | 'country' | 'specialties'>): Clinic {
  return {
    city: 'X',
    website: 'https://example.com',
    countryCode: 'XX',
    source: 'directory',
    sourceUrl: 'seed',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('filterAndSortClinics', () => {
  const set: Clinic[] = [
    clinic({
      id: 'a',
      name: 'Alpha',
      country: 'spain',
      specialties: ['ivf'],
      approximateCost: { ivf: 5000, icsi: 6000 },
    }),
    clinic({
      id: 'b',
      name: 'Beta',
      country: 'spain',
      specialties: ['ivf', 'egg-donation'],
      approximateCost: { ivf: 4000, icsi: 4500 },
    }),
    clinic({
      id: 'c',
      name: 'Gamma',
      country: 'spain',
      specialties: ['pgd'],
    }),
    clinic({
      id: 'd',
      name: 'Other',
      country: 'germany',
      specialties: ['ivf', 'egg-donation'],
    }),
  ];

  it('filters by country and treatment overlap, sorts by overlap then cost', () => {
    const { clinics, usedTreatmentFallback } = filterAndSortClinics(set, 'spain', [
      'egg-donation',
      'ivf',
    ]);
    expect(usedTreatmentFallback).toBe(false);
    expect(clinics.map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('falls back to all country clinics when no specialty match', () => {
    const { clinics, usedTreatmentFallback } = filterAndSortClinics(set, 'spain', [
      'sperm-donation',
    ]);
    expect(usedTreatmentFallback).toBe(true);
    expect(clinics.map((c) => c.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('puts clinics without cost after priced ones when overlap ties', () => {
    const { clinics } = filterAndSortClinics(
      [
        clinic({
          id: 'no-cost',
          name: 'NoCost',
          country: 'greece',
          specialties: ['ivf'],
        }),
        clinic({
          id: 'priced',
          name: 'Priced',
          country: 'greece',
          specialties: ['ivf'],
          approximateCost: { ivf: 3000, icsi: 3500 },
        }),
      ],
      'greece',
      ['ivf'],
    );
    expect(clinics.map((c) => c.id)).toEqual(['priced', 'no-cost']);
  });
});
