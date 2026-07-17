import type { Clinic, ClinicSourceKind, CrawlMeta, TreatmentType } from '../lib/types';

export type { Clinic, ClinicSourceKind, CrawlMeta, TreatmentType };

export interface RawClinic {
  name: string;
  countryCode: string;
  city: string;
  website?: string;
  specialties?: TreatmentType[];
  rating?: number;
  approximateCost?: Clinic['approximateCost'];
  description?: string;
  languages?: string[];
  source: ClinicSourceKind;
  sourceUrl: string;
}

export type SourceType = 'seed' | 'directory' | 'association' | 'clinic_site';

export interface SourceEntry {
  id: string;
  type: SourceType;
  url?: string;
  path?: string;
  countryCode?: string;
  itemSelector?: string;
  nameSelector?: string;
  citySelector?: string;
  websiteAttr?: string;
  websiteSelector?: string;
  enabled?: boolean;
}

export interface ClinicsPayload {
  clinics: Clinic[];
  meta: CrawlMeta;
}

export const INCREMENTAL_BATCH_SIZE = 5;
export const CRAWL_TTL_MS = 24 * 60 * 60 * 1000;
export const FETCH_TIMEOUT_MS = 12_000;
export const CRAWLER_USER_AGENT =
  'RoserBot/1.0 (+https://github.com/schroepa/kinderwunsch; clinic-data-refresh)';
