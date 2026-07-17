/**
 * Merges static directory_pack sources (see src/crawler/sources.json) into the
 * existing public/data/clinics.json without re-running clinic_site enrichment
 * on all clinics — that would mean dozens of live HTTP fetches against the
 * curated seed's real websites just to add a handful of directory rows.
 * Curated entries are left byte-for-byte as already enriched by
 * `npm run crawl:clinics`; only new directory_pack rows are normalized,
 * merged in (dedupe prefers curated), and given fallback city coordinates.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadSources } from '../src/crawler/runCrawl';
import { loadDirectoryPackSource } from '../src/crawler/adapters/directoryPack';
import { normalizeRawClinic } from '../src/crawler/normalize';
import { dedupeClinics } from '../src/crawler/dedupe';
import { attachClinicCoords } from '../src/lib/attachClinicCoords';
import type { Clinic, CrawlMeta } from '../src/crawler/types';

const root = process.cwd();

async function main() {
  const clinicsPath = join(root, 'public/data/clinics.json');
  const metaPath = join(root, 'public/data/clinics-meta.json');

  const existing = JSON.parse(await readFile(clinicsPath, 'utf8')) as Clinic[];
  const meta = JSON.parse(await readFile(metaPath, 'utf8')) as CrawlMeta;

  const sources = await loadSources(root);
  const packSources = sources.filter((s) => s.type === 'directory_pack');

  let addedCount = 0;
  let merged = [...existing];

  for (const source of packSources) {
    const rawRows = await loadDirectoryPackSource(source, root);
    const normalized = rawRows.map((r) => normalizeRawClinic(r));
    addedCount += normalized.length;
    merged.push(...normalized);
  }

  merged = dedupeClinics(merged);
  merged = attachClinicCoords(merged);

  const now = new Date().toISOString();
  const nextMeta: CrawlMeta = {
    ...meta,
    lastPartialAt: now,
    clinicCount: merged.length,
    stats: { ...meta.stats, directory: meta.stats.directory + addedCount },
  };

  await writeFile(clinicsPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  await writeFile(metaPath, JSON.stringify(nextMeta, null, 2) + '\n', 'utf8');

  const curated = merged.filter((c) => c.provenance === 'curated').length;
  const directory = merged.filter((c) => c.provenance === 'directory').length;
  console.log(
    `Merged ${addedCount} directory_pack rows. clinics.json now has ${merged.length} entries ` +
      `(curated: ${curated}, directory: ${directory}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
