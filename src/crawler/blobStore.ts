import { put, list } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ClinicsPayload } from './types';

const BLOB_PATHNAME = 'clinics-cache.json';

export async function readFallbackPayload(projectRoot: string): Promise<ClinicsPayload> {
  const clinics = JSON.parse(await readFile(join(projectRoot, 'public/data/clinics.json'), 'utf8'));
  let meta;
  try {
    meta = JSON.parse(await readFile(join(projectRoot, 'public/data/clinics-meta.json'), 'utf8'));
  } catch {
    meta = {
      lastCrawledAt: null,
      lastPartialAt: null,
      clinicCount: clinics.length,
      stats: { directory: clinics.length, association: 0, clinic_site: 0, errors: 0 },
      cursor: 0,
    };
  }
  return { clinics, meta };
}

export async function readLivePayload(projectRoot: string): Promise<ClinicsPayload> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return readFallbackPayload(projectRoot);
  }
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0];
    if (!hit) return readFallbackPayload(projectRoot);
    const res = await fetch(hit.url);
    if (!res.ok) return readFallbackPayload(projectRoot);
    return (await res.json()) as ClinicsPayload;
  } catch {
    return readFallbackPayload(projectRoot);
  }
}

export async function writeLivePayload(payload: ClinicsPayload): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(BLOB_PATHNAME, JSON.stringify(payload), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
