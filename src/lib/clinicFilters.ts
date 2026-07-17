import type { Clinic, TreatmentType } from './types';

export type ClinicFilterState = {
  country: string;
  treatment: 'all' | TreatmentType;
  /** Upper cost bound in EUR; `null` means no price filter. */
  maxPrice: number | null;
  query: string;
};

/** Cost used for price filtering given an optional treatment focus. */
export function clinicReferenceCost(
  clinic: Clinic,
  treatment: 'all' | TreatmentType,
): number | null {
  const cost = clinic.approximateCost;
  if (!cost) return null;

  switch (treatment) {
    case 'ivf':
      return cost.ivf;
    case 'icsi':
      return cost.icsi;
    case 'egg-donation':
      return cost.eggDonation ?? null;
    case 'sperm-donation':
      return cost.spermDonation ?? null;
    case 'pgd':
      // No dedicated PGD field — use IVF as orientation.
      return cost.ivf;
    case 'all': {
      const values = [cost.ivf, cost.icsi, cost.eggDonation, cost.spermDonation].filter(
        (n): n is number => typeof n === 'number',
      );
      return values.length ? Math.min(...values) : null;
    }
  }
}

export function matchesClinicFilters(clinic: Clinic, filters: ClinicFilterState): boolean {
  if (filters.country !== 'all' && clinic.countryCode !== filters.country) {
    return false;
  }

  if (filters.treatment !== 'all' && !clinic.specialties.includes(filters.treatment)) {
    return false;
  }

  if (filters.maxPrice != null) {
    const price = clinicReferenceCost(clinic, filters.treatment);
    if (price == null || price > filters.maxPrice) return false;
  }

  const query = filters.query.trim().toLowerCase();
  if (query) {
    const haystack = `${clinic.name} ${clinic.city} ${clinic.countryCode}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
}

export const PRICE_FILTER_OPTIONS: { value: string; label: string; max: number | null }[] = [
  { value: 'all', label: 'Alle Preise', max: null },
  { value: '3000', label: 'bis 3.000 €', max: 3000 },
  { value: '5000', label: 'bis 5.000 €', max: 5000 },
  { value: '8000', label: 'bis 8.000 €', max: 8000 },
  { value: '12000', label: 'bis 12.000 €', max: 12000 },
];
