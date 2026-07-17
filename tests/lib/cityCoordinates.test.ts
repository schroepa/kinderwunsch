import { describe, expect, it } from 'vitest';
import { lookupCityCoords } from '../../src/lib/cityCoordinates';
import seedClinics from '../../public/data/clinics.seed.json';

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

  it('matches aliases for Phase 3 volume expansion cities', () => {
    expect(lookupCityCoords('München', 'DE')?.lat).toBeCloseTo(48.1351, 2);
    expect(lookupCityCoords('Munich', 'DE')?.lat).toBeCloseTo(48.1351, 2);
    expect(lookupCityCoords('Köln', 'DE')?.lat).toBeCloseTo(50.9375, 2);
    expect(lookupCityCoords('Cologne', 'DE')?.lat).toBeCloseTo(50.9375, 2);
    expect(lookupCityCoords('Düsseldorf', 'DE')?.lat).toBeCloseTo(51.2277, 2);
    expect(lookupCityCoords('Rom', 'IT')?.lat).toBeCloseTo(41.9028, 2);
    expect(lookupCityCoords('Rome', 'IT')?.lat).toBeCloseTo(41.9028, 2);
    expect(lookupCityCoords('Roma', 'IT')?.lat).toBeCloseTo(41.9028, 2);
    expect(lookupCityCoords('Neapel', 'IT')?.lat).toBeCloseTo(40.8518, 2);
    expect(lookupCityCoords('Naples', 'IT')?.lat).toBeCloseTo(40.8518, 2);
    expect(lookupCityCoords('Krakau', 'PL')?.lat).toBeCloseTo(50.0647, 2);
    expect(lookupCityCoords('Krakow', 'PL')?.lat).toBeCloseTo(50.0647, 2);
    expect(lookupCityCoords('Breslau', 'PL')?.lat).toBeCloseTo(51.1079, 2);
    expect(lookupCityCoords('Wroclaw', 'PL')?.lat).toBeCloseTo(51.1079, 2);
    expect(lookupCityCoords('Sevilla', 'ES')?.lat).toBeCloseTo(37.3891, 2);
    expect(lookupCityCoords('Seville', 'ES')?.lat).toBeCloseTo(37.3891, 2);
    expect(lookupCityCoords('Zlín', 'CZ')?.lat).toBeCloseTo(49.2262, 2);
    expect(lookupCityCoords('Nizza', 'FR')?.lat).toBeCloseTo(43.7102, 2);
    expect(lookupCityCoords('Nice', 'FR')?.lat).toBeCloseTo(43.7102, 2);
  });

  it('matches cities from the Task 3 directory packs (CH, IE)', () => {
    expect(lookupCityCoords('Basel', 'CH')?.lat).toBeCloseTo(47.5596, 2);
    expect(lookupCityCoords('Bern', 'CH')?.lat).toBeCloseTo(46.948, 2);
    expect(lookupCityCoords('Zürich', 'CH')?.lat).toBeCloseTo(47.3769, 2);
    expect(lookupCityCoords('Luzern', 'CH')?.lat).toBeCloseTo(47.0502, 2);
    expect(lookupCityCoords('Lausanne', 'CH')?.lat).toBeCloseTo(46.5197, 2);
    expect(lookupCityCoords('Dublin', 'IE')?.lat).toBeCloseTo(53.3498, 2);
    expect(lookupCityCoords('Cork', 'IE')?.lat).toBeCloseTo(51.8985, 2);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(lookupCityCoords('  berlin  ', 'DE')).toEqual({ lat: 52.52, lng: 13.405 });
    expect(lookupCityCoords('BERLIN', 'de')).toEqual({ lat: 52.52, lng: 13.405 });
  });

  it('returns undefined for unknown city', () => {
    expect(lookupCityCoords('Nowhereville', 'XX')).toBeUndefined();
  });

  it('covers every unique city+countryCode in the clinics seed', () => {
    type SeedClinic = { city: string; countryCode: string };
    const seedCities = new Map<string, [string, string]>();
    for (const clinic of seedClinics as SeedClinic[]) {
      const key = `${clinic.city}|${clinic.countryCode}`;
      seedCities.set(key, [clinic.city, clinic.countryCode]);
    }

    expect(seedCities.size).toBeGreaterThanOrEqual(30);

    for (const [city, countryCode] of seedCities.values()) {
      expect(lookupCityCoords(city, countryCode), `${city}, ${countryCode}`).toBeDefined();
    }
  });
});
