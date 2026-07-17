export const COUNTRY_ISO: Record<string, string> = {
  germany: 'DE',
  czech: 'CZ',
  poland: 'PL',
  spain: 'ES',
  greece: 'GR',
};

export function countryIso(countryId: string): string {
  return COUNTRY_ISO[countryId] ?? countryId.slice(0, 2).toUpperCase();
}
