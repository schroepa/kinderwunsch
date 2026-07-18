import type { Clinic, ClinicProvenance } from './types';

export function resolveProvenance(clinic: Clinic): ClinicProvenance {
  if (clinic.provenance) return clinic.provenance;
  if (clinic.sourceUrl?.includes('clinics.seed')) return 'curated';
  if (clinic.source === 'association') return 'association';
  return 'directory';
}

export function provenanceLabel(provenance: ClinicProvenance): string {
  switch (provenance) {
    case 'curated':
      return 'Kuratiert';
    case 'association':
      return 'Verband / Register';
    default:
      return 'Aus Verzeichnis';
  }
}
