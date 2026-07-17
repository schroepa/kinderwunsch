import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadSeedSource } from './adapters/seed';
import { loadDirectoryPackSource } from './adapters/directoryPack';
import { parseHtmlList } from './adapters/htmlList';
import { enrichFromClinicHtml } from './adapters/clinicSite';
import { fetchHtml } from './fetchHtml';
import { normalizeRawClinic } from './normalize';
import { dedupeClinics } from './dedupe';
import {
  INCREMENTAL_BATCH_SIZE,
  type Clinic,
  type ClinicsPayload,
  type CrawlMeta,
  type SourceEntry,
} from './types';

export async function loadSources(projectRoot: string): Promise<SourceEntry[]> {
  const raw = await readFile(join(projectRoot, 'src/crawler/sources.json'), 'utf8');
  return (JSON.parse(raw) as SourceEntry[]).filter((s) => s.enabled !== false);
}

function emptyMeta(): CrawlMeta {
  return {
    lastCrawledAt: null,
    lastPartialAt: null,
    clinicCount: 0,
    stats: { directory: 0, association: 0, clinic_site: 0, errors: 0 },
    cursor: 0,
  };
}

export async function runFullCrawl(projectRoot: string): Promise<ClinicsPayload> {
  const sources = await loadSources(projectRoot);
  const meta = emptyMeta();
  let clinics: Clinic[] = [];

  for (const source of sources) {
    if (source.type === 'seed') {
      const rawRows = await loadSeedSource(source, projectRoot);
      clinics.push(...rawRows.map((r) => normalizeRawClinic(r)));
      meta.stats.directory += rawRows.length;
      continue;
    }
    if (source.type === 'directory_pack') {
      const rawRows = await loadDirectoryPackSource(source, projectRoot);
      clinics.push(...rawRows.map((r) => normalizeRawClinic(r)));
      meta.stats.directory += rawRows.length;
      continue;
    }
    if (source.type === 'directory' || source.type === 'association') {
      if (!source.url) {
        meta.stats.errors += 1;
        continue;
      }
      const res = await fetchHtml(source.url);
      if (!res.ok) {
        meta.stats.errors += 1;
        continue;
      }
      const rawRows = parseHtmlList(res.html, source);
      clinics.push(...rawRows.map((r) => normalizeRawClinic(r)));
      if (source.type === 'directory') meta.stats.directory += rawRows.length;
      else meta.stats.association += rawRows.length;
    }
  }

  clinics = dedupeClinics(clinics);

  for (let i = 0; i < clinics.length; i++) {
    const res = await fetchHtml(clinics[i].website);
    if (!res.ok) {
      clinics[i] = { ...clinics[i], stale: true };
      meta.stats.errors += 1;
      continue;
    }
    clinics[i] = enrichFromClinicHtml(res.html, clinics[i]);
    meta.stats.clinic_site += 1;
  }

  clinics = dedupeClinics(clinics);
  const now = new Date().toISOString();
  meta.lastCrawledAt = now;
  meta.lastPartialAt = now;
  meta.clinicCount = clinics.length;
  meta.cursor = 0;
  return { clinics, meta };
}

export async function runIncrementalBatch(
  current: ClinicsPayload,
  projectRoot: string,
): Promise<ClinicsPayload> {
  const sources = await loadSources(projectRoot);
  const liveSources = sources.filter((s) => s.type === 'directory' || s.type === 'association');
  const enrichable = current.clinics.filter(
    (c) => c.website && !c.website.includes('unknown.invalid'),
  );

  type WorkItem = { kind: 'source'; index: number } | { kind: 'enrich'; index: number };
  const workItems: WorkItem[] = [
    ...liveSources.map((_, index) => ({ kind: 'source' as const, index })),
    ...enrichable.map((_, index) => ({ kind: 'enrich' as const, index })),
  ];

  if (workItems.length === 0) {
    const now = new Date().toISOString();
    return {
      ...current,
      meta: { ...current.meta, lastCrawledAt: now, lastPartialAt: now },
    };
  }

  let cursor = current.meta.cursor % workItems.length;
  const start = cursor;
  let clinics = [...current.clinics];
  const meta = { ...current.meta, stats: { ...current.meta.stats } };

  for (let n = 0; n < INCREMENTAL_BATCH_SIZE; n++) {
    const item = workItems[cursor];
    if (item.kind === 'source') {
      const source = liveSources[item.index];
      if (source?.url) {
        const res = await fetchHtml(source.url);
        if (res.ok) {
          const rawRows = parseHtmlList(res.html, source);
          clinics.push(...rawRows.map((r) => normalizeRawClinic(r)));
          if (source.type === 'association') meta.stats.association += rawRows.length;
          else meta.stats.directory += rawRows.length;
        } else {
          meta.stats.errors += 1;
        }
      }
    } else {
      const target = enrichable[item.index];
      const idx = clinics.findIndex((c) => c.id === target.id);
      if (idx >= 0) {
        const res = await fetchHtml(clinics[idx].website);
        if (res.ok) {
          clinics[idx] = enrichFromClinicHtml(res.html, clinics[idx]);
          meta.stats.clinic_site += 1;
        } else {
          clinics[idx] = { ...clinics[idx], stale: true };
          meta.stats.errors += 1;
        }
      }
    }
    cursor = (cursor + 1) % workItems.length;
  }

  clinics = dedupeClinics(clinics);
  const now = new Date().toISOString();
  meta.lastPartialAt = now;
  meta.cursor = cursor;
  meta.clinicCount = clinics.length;
  const completedCycle =
    workItems.length <= INCREMENTAL_BATCH_SIZE || (cursor === 0 && start !== 0);
  if (completedCycle) meta.lastCrawledAt = now;

  return { clinics, meta };
}
