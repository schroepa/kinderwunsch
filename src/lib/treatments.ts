import type { TreatmentType } from './types';

export const TREATMENT_INFO: Record<
  TreatmentType,
  { label: string; shortLabel: string; methodName: string; description: string }
> = {
  ivf: {
    label: 'IVF (Standard)',
    shortLabel: 'IVF',
    methodName: 'In-vitro-Fertilisation',
    description:
      'In-vitro-Fertilisation: Eizellen und Spermien werden im Labor zusammengeführt; der Embryo wird in die Gebärmutter übertragen.',
  },
  icsi: {
    label: 'ICSI',
    shortLabel: 'ICSI',
    methodName: 'Intrazytoplasmatische Spermieninjektion',
    description:
      'Intrazytoplasmatische Spermieninjektion: Ein einzelnes Spermium wird direkt in die Eizelle injiziert — oft bei männlicher Unfruchtbarkeit.',
  },
  'egg-donation': {
    label: 'Eizellspende',
    shortLabel: 'Eizellspende',
    methodName: 'Eizellspende',
    description:
      'Behandlung mit gespendeten Eizellen einer Spenderin. In Deutschland stark eingeschränkt, in mehreren EU-Ländern möglich.',
  },
  'sperm-donation': {
    label: 'Samenspende',
    shortLabel: 'Samenspende',
    methodName: 'Samenspende',
    description:
      'Behandlung mit Spendersamen — z. B. bei fehlenden oder stark eingeschränkten eigenen Spermien oder für Solo-Mütter / gleichgeschlechtliche Paare.',
  },
  pgd: {
    label: 'PID (Präimplantationsdiagnostik)',
    shortLabel: 'PID',
    methodName: 'Präimplantationsdiagnostik',
    description:
      'Genetische Untersuchung von Embryonen vor dem Transfer — z. B. bei bekannten Erbkrankheiten. Rechtlich je Land unterschiedlich geregelt.',
  },
};

export const TREATMENT_ORDER: TreatmentType[] = [
  'ivf',
  'icsi',
  'egg-donation',
  'sperm-donation',
  'pgd',
];
