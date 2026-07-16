const ISO_TO_SLUG: Record<string, string> = {
  DE: 'germany',
  CZ: 'czech',
  PL: 'poland',
  ES: 'spain',
  GR: 'greece',
};

const SLUG_TO_ISO: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_TO_SLUG).map(([iso, slug]) => [slug, iso]),
);

export function toCountrySlug(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  return ISO_TO_SLUG[code] ?? code.toLowerCase();
}

export function toCountryCode(slugOrCode: string): string {
  const key = slugOrCode.trim().toLowerCase();
  if (SLUG_TO_ISO[key]) return SLUG_TO_ISO[key];
  if (key.length === 2) return key.toUpperCase();
  return key.toUpperCase();
}
