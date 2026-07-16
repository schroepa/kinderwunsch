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

export interface Clinic {
  id: string;
  name: string;
  country: string;
  city: string;
  rating: number;
  website: string;
  specialties: TreatmentType[];
  approximateCost: {
    ivf: number;
    icsi: number;
    eggDonation?: number;
    spermDonation?: number;
  };
}
