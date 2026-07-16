export const prerender = false;

import type { APIRoute } from 'astro';
import { isFresh } from '../../crawler/cacheAge';
import { runIncrementalBatch } from '../../crawler/runCrawl';
import { readLivePayload, writeLivePayload } from '../../crawler/blobStore';
import { CRAWL_TTL_MS } from '../../crawler/types';
import type { ClinicsApiResponse } from '../../lib/types';

let inFlight: Promise<void> | null = null;

export const GET: APIRoute = async () => {
  const root = process.cwd();
  const payload = await readLivePayload(root);
  const now = Date.now();
  const fresh = isFresh(payload.meta.lastCrawledAt, now, CRAWL_TTL_MS);

  let refreshing = false;
  if (!fresh && !inFlight) {
    refreshing = true;
    const snapshot = payload;
    inFlight = (async () => {
      try {
        const next = await runIncrementalBatch(snapshot, root);
        await writeLivePayload(next);
      } catch (e) {
        console.error('incremental crawl failed', e);
      } finally {
        inFlight = null;
      }
    })();
  } else if (!fresh && inFlight) {
    refreshing = true;
  }

  const body: ClinicsApiResponse = {
    clinics: payload.clinics,
    meta: { ...payload.meta, refreshing },
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
