import { describe, expect, it } from 'vitest';
import { attachClinicCoords } from '../../src/lib/attachClinicCoords';
import type { Clinic } from '../../src/lib/types';

function base(partial: Partial<Clinic> & Pick<Clinic, 'id' | 'name' | 'city' | 'countryCode'>): Clinic {
  return {
    country: 'germany',
    website: 'https://example.com',
    specialties: ['ivf'],
    source: 'directory',
    sourceUrl: 'seed',
    updatedAt: '2026-07-17T00:00:00.000Z',
    ...partial,
  };
}

describe('attachClinicCoords', () => {
  it('adds lat/lng when city is known', () => {
    const [c] = attachClinicCoords([base({ id: '1', name: 'A', city: 'Berlin', countryCode: 'DE' })]);
    expect(c.lat).toBeDefined();
    expect(c.lng).toBeDefined();
  });

  it('preserves existing lat/lng', () => {
    const [c] = attachClinicCoords([
      base({ id: '1', name: 'A', city: 'Berlin', countryCode: 'DE', lat: 1, lng: 2 }),
    ]);
    expect(c.lat).toBe(1);
    expect(c.lng).toBe(2);
  });

  it('leaves unknown cities without coords', () => {
    const [c] = attachClinicCoords([
      base({ id: '1', name: 'A', city: 'Unknown', countryCode: 'DE' }),
    ]);
    expect(c.lat).toBeUndefined();
  });
});
