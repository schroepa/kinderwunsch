import { describe, expect, it } from 'vitest';
import { toCountrySlug, toCountryCode } from '../../src/crawler/countryMap';

describe('countryMap extended EU', () => {
  it('maps ISO codes used in seed clinics', () => {
    expect(toCountrySlug('AT')).toBe('austria');
    expect(toCountrySlug('DK')).toBe('denmark');
    expect(toCountrySlug('NL')).toBe('netherlands');
    expect(toCountrySlug('PT')).toBe('portugal');
    expect(toCountrySlug('IT')).toBe('italy');
    expect(toCountrySlug('FR')).toBe('france');
  });

  it('maps slugs back to ISO', () => {
    expect(toCountryCode('austria')).toBe('AT');
    expect(toCountryCode('denmark')).toBe('DK');
    expect(toCountryCode('netherlands')).toBe('NL');
    expect(toCountryCode('portugal')).toBe('PT');
    expect(toCountryCode('italy')).toBe('IT');
    expect(toCountryCode('france')).toBe('FR');
  });
});
