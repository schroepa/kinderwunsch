import { lookupCityCoords } from './cityCoordinates';
import type { Clinic } from './types';

export function attachClinicCoords(clinics: Clinic[]): Clinic[] {
  return clinics.map((clinic) => {
    if (clinic.lat != null && clinic.lng != null) {
      return clinic;
    }
    const coords = lookupCityCoords(clinic.city, clinic.countryCode);
    return coords ? { ...clinic, ...coords } : clinic;
  });
}
