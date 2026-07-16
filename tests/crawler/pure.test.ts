import { describe, it, expect } from 'vitest';
import { toCountrySlug, toCountryCode } from '../../src/crawler/countryMap';
import { isFresh } from '../../src/crawler/cacheAge';
import { normalizeRawClinic } from '../../src/crawler/normalize';
import { dedupeClinics } from '../../src/crawler/dedupe';
import { CRAWL_TTL_MS } from '../../src/crawler/types';
import type { RawClinic } from '../../src/crawler/types';

describe('countryMap', () => {
  it('maps ISO to existing recommendation slugs', () => {
    expect(toCountrySlug('DE')).toBe('germany');
    expect(toCountrySlug('CZ')).toBe('czech');
    expect(toCountrySlug('PL')).toBe('poland');
    expect(toCountrySlug('ES')).toBe('spain');
    expect(toCountrySlug('GR')).toBe('greece');
  });

  it('falls back to lowercase ISO for other EU countries', () => {
    expect(toCountrySlug('PT')).toBe('pt');
    expect(toCountryCode('germany')).toBe('DE');
  });
});

describe('isFresh', () => {
  it('is fresh within TTL', () => {
    const now = Date.parse('2026-07-16T12:00:00.000Z');
    expect(isFresh('2026-07-16T00:00:00.000Z', now, CRAWL_TTL_MS)).toBe(true);
  });

  it('is stale after TTL or when null', () => {
    const now = Date.parse('2026-07-17T13:00:00.000Z');
    expect(isFresh('2026-07-16T12:00:00.000Z', now, CRAWL_TTL_MS)).toBe(false);
    expect(isFresh(null, now, CRAWL_TTL_MS)).toBe(false);
  });
});

describe('normalize + dedupe', () => {
  it('normalizes and dedupes by website host', () => {
    const raw: RawClinic = {
      name: ' IVI Barcelona ',
      countryCode: 'es',
      city: 'Barcelona',
      website: 'https://www.ivi.es/barcelona/',
      source: 'directory',
      sourceUrl: 'https://example.com/dir',
    };
    const a = normalizeRawClinic(raw);
    const b = normalizeRawClinic({
      ...raw,
      name: 'IVI Barcelona',
      website: 'http://ivi.es/barcelona',
      description: 'Leading clinic',
      source: 'clinic_site',
    });
    const merged = dedupeClinics([a, b]);
    expect(merged).toHaveLength(1);
    expect(merged[0].description).toBe('Leading clinic');
    expect(merged[0].country).toBe('spain');
    expect(merged[0].countryCode).toBe('ES');
  });
});
