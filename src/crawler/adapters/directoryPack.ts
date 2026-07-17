import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RawClinic, SourceEntry } from '../types';

export interface DirectoryPackRow {
  name: string;
  city: string;
  countryCode: string;
  website?: string;
}

export interface DirectoryPackFile {
  _meta: {
    sourceUrl: string;
    accessedAt: string;
    note?: string;
  };
  clinics: DirectoryPackRow[];
}

/**
 * Loads a static "directory pack": a dated JSON snapshot of a public allowlisted
 * directory/register page, used when live scraping is JS-rendered or ToS-hostile.
 * Rows are tagged provenance: 'directory' (never 'curated').
 */
export async function loadDirectoryPackSource(
  entry: SourceEntry,
  projectRoot: string,
): Promise<RawClinic[]> {
  if (!entry.path) throw new Error(`Directory pack source ${entry.id} missing path`);
  const abs = join(projectRoot, entry.path);
  const pack = JSON.parse(await readFile(abs, 'utf8')) as DirectoryPackFile;
  const sourceUrl = pack._meta?.sourceUrl ?? entry.path;

  return pack.clinics.map((c) => ({
    name: c.name,
    countryCode: c.countryCode,
    city: c.city,
    website: c.website,
    source: 'directory' as const,
    sourceUrl,
    provenance: 'directory' as const,
  }));
}
