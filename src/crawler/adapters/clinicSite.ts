import * as cheerio from 'cheerio';
import type { Clinic, TreatmentType } from '../types';

const SPECIALTY_HINTS: Array<{ re: RegExp; type: TreatmentType }> = [
  { re: /\bivf\b/i, type: 'ivf' },
  { re: /\bicsi\b/i, type: 'icsi' },
  { re: /egg\s*donation|eizellspende/i, type: 'egg-donation' },
  { re: /sperm\s*donation|samenspende/i, type: 'sperm-donation' },
  { re: /\bpgd\b|pid\b|preimplant/i, type: 'pgd' },
];

export function enrichFromClinicHtml(html: string, base: Clinic): Clinic {
  const $ = cheerio.load(html);
  const meta = $('meta[name="description"]').attr('content')?.trim();
  const paragraph = $('p').first().text().trim();
  const description = (meta || paragraph || '').slice(0, 280) || undefined;
  const blob = `${meta ?? ''} ${$('body').text()}`.slice(0, 5000);
  const specialties = new Set(base.specialties);
  for (const hint of SPECIALTY_HINTS) {
    if (hint.re.test(blob)) specialties.add(hint.type);
  }
  const languages: string[] = [];
  if (/english|englisch|\ben\b/i.test(blob)) languages.push('en');
  if (/german|deutsch|\bde\b/i.test(blob)) languages.push('de');
  return {
    ...base,
    description,
    specialties: Array.from(specialties),
    languages: languages.length
      ? Array.from(new Set([...(base.languages ?? []), ...languages]))
      : base.languages,
    source: 'clinic_site',
    sourceUrl: base.website,
    updatedAt: new Date().toISOString(),
    stale: false,
  };
}
