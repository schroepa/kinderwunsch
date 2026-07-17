import type { TreatmentType } from './types';

export const SITE_ORIGIN = 'https://roser.vercel.app';

export type WissenCategory = 'treatment' | 'country' | 'guide' | 'faq';

export const CATEGORY_LABELS: Record<WissenCategory, string> = {
  treatment: 'Behandlungen',
  country: 'Länder',
  guide: 'Praxis',
  faq: 'FAQ',
};

export const TREATMENT_GUIDE_SLUG: Record<TreatmentType, string> = {
  ivf: 'ivf',
  icsi: 'icsi',
  'egg-donation': 'eizellspende',
  'sperm-donation': 'samenspende',
  pgd: 'pid',
};

export const COUNTRY_GUIDE_SLUG: Record<string, string> = {
  germany: 'land-deutschland',
  czech: 'land-tschechien',
  poland: 'land-polen',
  spain: 'land-spanien',
  greece: 'land-griechenland',
};

export function treatmentGuideSlug(t: TreatmentType): string | undefined {
  return TREATMENT_GUIDE_SLUG[t];
}

export function treatmentGuidePath(t: TreatmentType): string {
  return `/wissen/${TREATMENT_GUIDE_SLUG[t]}`;
}

export function countryGuidePath(countryId: string): string | null {
  const slug = COUNTRY_GUIDE_SLUG[countryId];
  return slug ? `/wissen/${slug}` : null;
}
