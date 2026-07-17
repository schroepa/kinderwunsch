// City centroids, approximate (source: Wikipedia/OpenStreetMap). Used as a
// static geocoding fallback for clinics that don't carry precise lat/lng.
export type Coords = { lat: number; lng: number };

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const CITY_COORDS: Record<string, Coords> = {
  'berlin|DE': { lat: 52.52, lng: 13.405 },
  'hamburg|DE': { lat: 53.551, lng: 9.994 },
  'prag|CZ': { lat: 50.075, lng: 14.438 },
  'prague|CZ': { lat: 50.075, lng: 14.438 },
  'brunn|CZ': { lat: 49.195, lng: 16.607 },
  'brno|CZ': { lat: 49.195, lng: 16.607 },
  'warschau|PL': { lat: 52.2297, lng: 21.0122 },
  'warsaw|PL': { lat: 52.2297, lng: 21.0122 },
  'stettin|PL': { lat: 53.4285, lng: 14.5528 },
  'szczecin|PL': { lat: 53.4285, lng: 14.5528 },
  'posen|PL': { lat: 52.4064, lng: 16.9252 },
  'poznan|PL': { lat: 52.4064, lng: 16.9252 },
  'barcelona|ES': { lat: 41.3851, lng: 2.1734 },
  'alicante|ES': { lat: 38.3452, lng: -0.481 },
  'athen|GR': { lat: 37.9838, lng: 23.7275 },
  'athens|GR': { lat: 37.9838, lng: 23.7275 },
  'thessaloniki|GR': { lat: 40.6401, lng: 22.9444 },
  'kreta|GR': { lat: 35.3387, lng: 25.1442 },
  'crete|GR': { lat: 35.3387, lng: 25.1442 },
  'heraklion|GR': { lat: 35.3387, lng: 25.1442 },
  'lissabon|PT': { lat: 38.7223, lng: -9.1393 },
  'lisbon|PT': { lat: 38.7223, lng: -9.1393 },
  'rotterdam|NL': { lat: 51.9244, lng: 4.4777 },
  'kopenhagen|DK': { lat: 55.6761, lng: 12.5683 },
  'copenhagen|DK': { lat: 55.6761, lng: 12.5683 },
  'wien|AT': { lat: 48.2082, lng: 16.3738 },
  'vienna|AT': { lat: 48.2082, lng: 16.3738 },
  'mailand|IT': { lat: 45.4642, lng: 9.19 },
  'milano|IT': { lat: 45.4642, lng: 9.19 },
  'milan|IT': { lat: 45.4642, lng: 9.19 },
  'paris|FR': { lat: 48.8566, lng: 2.3522 },
};

export function lookupCityCoords(city: string, countryCode: string): Coords | undefined {
  const key = `${normalize(city)}|${countryCode.trim().toUpperCase()}`;
  return CITY_COORDS[key];
}
