import { toCountryCode } from '../crawler/countryMap';

/** ISO alpha-2 for a recommendation country id (slug). */
export function countryIso(countryId: string): string {
  return toCountryCode(countryId);
}
