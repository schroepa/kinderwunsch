import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Clinic, RawClinic, SourceEntry } from '../types';

export async function loadSeedSource(entry: SourceEntry, projectRoot: string): Promise<RawClinic[]> {
  if (!entry.path) throw new Error(`Seed source ${entry.id} missing path`);
  const abs = join(projectRoot, entry.path);
  const raw = JSON.parse(await readFile(abs, 'utf8')) as Clinic[];
  return raw.map((c) => ({
    name: c.name,
    countryCode: c.countryCode ?? 'DE',
    city: c.city,
    website: c.website,
    specialties: c.specialties,
    rating: c.rating,
    approximateCost: c.approximateCost,
    description: c.description,
    languages: c.languages,
    source: 'directory' as const,
    sourceUrl: entry.path!,
  }));
}
