import { describe, expect, it } from 'vitest';
import { lookupCityCoords } from '../../src/lib/cityCoordinates';

describe('lookupCityCoords', () => {
  it('finds Berlin DE', () => {
    expect(lookupCityCoords('Berlin', 'DE')).toEqual({ lat: 52.52, lng: 13.405 });
  });

  it('matches aliases for Prague', () => {
    expect(lookupCityCoords('Prag', 'CZ')?.lat).toBeCloseTo(50.075, 2);
    expect(lookupCityCoords('Prague', 'CZ')?.lat).toBeCloseTo(50.075, 2);
  });

  it('matches aliases for Brno', () => {
    expect(lookupCityCoords('Brünn', 'CZ')?.lat).toBeCloseTo(49.195, 2);
    expect(lookupCityCoords('Brno', 'CZ')?.lat).toBeCloseTo(49.195, 2);
  });

  it('matches aliases for Vienna, Milan, Copenhagen, Lisbon', () => {
    expect(lookupCityCoords('Wien', 'AT')?.lat).toBeCloseTo(48.2082, 2);
    expect(lookupCityCoords('Vienna', 'AT')?.lat).toBeCloseTo(48.2082, 2);
    expect(lookupCityCoords('Mailand', 'IT')?.lat).toBeCloseTo(45.4642, 2);
    expect(lookupCityCoords('Milano', 'IT')?.lat).toBeCloseTo(45.4642, 2);
    expect(lookupCityCoords('Kopenhagen', 'DK')?.lat).toBeCloseTo(55.6761, 2);
    expect(lookupCityCoords('Copenhagen', 'DK')?.lat).toBeCloseTo(55.6761, 2);
    expect(lookupCityCoords('Lissabon', 'PT')?.lat).toBeCloseTo(38.7223, 2);
    expect(lookupCityCoords('Lisbon', 'PT')?.lat).toBeCloseTo(38.7223, 2);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(lookupCityCoords('  berlin  ', 'DE')).toEqual({ lat: 52.52, lng: 13.405 });
    expect(lookupCityCoords('BERLIN', 'de')).toEqual({ lat: 52.52, lng: 13.405 });
  });

  it('returns undefined for unknown city', () => {
    expect(lookupCityCoords('Nowhereville', 'XX')).toBeUndefined();
  });

  it('covers every unique city+countryCode in the clinics seed', () => {
    const seedCities: Array<[string, string]> = [
      ['Berlin', 'DE'],
      ['Hamburg', 'DE'],
      ['Prag', 'CZ'],
      ['Brünn', 'CZ'],
      ['Warschau', 'PL'],
      ['Stettin', 'PL'],
      ['Posen', 'PL'],
      ['Barcelona', 'ES'],
      ['Alicante', 'ES'],
      ['Athen', 'GR'],
      ['Thessaloniki', 'GR'],
      ['Kreta', 'GR'],
      ['Lissabon', 'PT'],
      ['Rotterdam', 'NL'],
      ['Kopenhagen', 'DK'],
      ['Wien', 'AT'],
      ['Mailand', 'IT'],
      ['Paris', 'FR'],
    ];

    for (const [city, countryCode] of seedCities) {
      expect(lookupCityCoords(city, countryCode), `${city}, ${countryCode}`).toBeDefined();
    }
  });
});
