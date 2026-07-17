export type RelationshipStatus = 'married' | 'unmarried' | 'single' | 'same-sex';

export type TreatmentType = 'ivf' | 'icsi' | 'egg-donation' | 'sperm-donation' | 'pgd';

export interface UserData {
  femaleAge: number;
  maleAge: number;
  relationshipStatus: RelationshipStatus;
  location: string;
  budget: number;
  treatments: TreatmentType[];
}

export interface Country {
  id: string;
  name: string;
  flagEmoji: string;
  baseCost: number;
  distanceFromBerlin: number;
  pros: string[];
  cons: string[];
}

export interface CountryRecommendation extends Country {
  dynamicPros: string[];
  dynamicCons: string[];
  score: number;
  costEstimate: number;
  legalStatus: 'allowed' | 'restricted' | 'forbidden';
}

export type ClinicSourceKind = 'directory' | 'association' | 'clinic_site';

export type ClinicProvenance = 'curated' | 'directory' | 'association';

export interface Clinic {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  specialties: TreatmentType[];
  countryCode: string;
  source: ClinicSourceKind;
  sourceUrl: string;
  updatedAt: string;
  rating?: number;
  approximateCost?: {
    ivf: number;
    icsi: number;
    eggDonation?: number;
    spermDonation?: number;
  };
  description?: string;
  languages?: string[];
  stale?: boolean;
  /** Optional city-level coordinates for map markers. */
  lat?: number;
  lng?: number;
  provenance?: ClinicProvenance;
}

export interface CrawlStats {
  directory: number;
  association: number;
  clinic_site: number;
  errors: number;
}

export interface CrawlMeta {
  lastCrawledAt: string | null;
  lastPartialAt: string | null;
  clinicCount: number;
  stats: CrawlStats;
  cursor: number;
}

export interface ClinicsApiResponse {
  clinics: Clinic[];
  meta: CrawlMeta & { refreshing: boolean };
}
