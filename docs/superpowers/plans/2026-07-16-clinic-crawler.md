# Clinic Crawler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an allowlist-based EU clinic crawler with build-time JSON, a Vercel `/api/clinics` stale-while-revalidate endpoint, and a hybrid Results UI (per-country clinics + EU browse).

**Architecture:** Curated adapters (seed directory, HTML directory/association pages, clinic-site enrichment) normalize into an extended `Clinic` model, dedupe, and write `public/data/clinics.json`. Runtime serves Blob cache (fallback: static JSON); if older than 24h, return stale data and run one incremental batch per request. Client loads via API on app use / session / „Kliniken anzeigen“ with localStorage day-cap.

**Tech Stack:** Astro 4 hybrid + `@astrojs/vercel`, React 18, Cheerio, Vitest, `@vercel/blob`, TypeScript

**Spec:** `docs/superpowers/specs/2026-07-16-clinic-crawler-design.md`

## Global Constraints

- Allowlist only — no open web discovery (`src/crawler/sources.json`)
- Browser never crawls — only `GET /api/clinics`
- After a completed cycle (`lastCrawledAt`), no new crawl for 24h; while stale, one incremental batch per request with in-flight lock
- Batch size default: `INCREMENTAL_BATCH_SIZE = 5` sources/enrichments
- Do not invent `rating` or `approximateCost`; make them optional; UI shows „k. A.“
- Disclaimer copy: „Angaben ohne Gewähr; bitte bei der Klinik bestätigen.“
- Keep existing country recommendation logic untouched
- German UI strings

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/lib/types.ts` | Shared `Clinic` (+ optional fields) and `ClinicsApiResponse` |
| `src/crawler/types.ts` | `RawClinic`, `CrawlMeta`, `SourceEntry`, adapter contracts |
| `src/crawler/sources.json` | Allowlist of seed/directory/association/clinic_site entries |
| `src/crawler/countryMap.ts` | ISO ↔ app `country` slug used by recommendations |
| `src/crawler/fetchHtml.ts` | Shared fetch with UA, timeout, 429 handling |
| `src/crawler/normalize.ts` | `RawClinic` → `Clinic` |
| `src/crawler/dedupe.ts` | Merge by website / name+city+code |
| `src/crawler/cacheAge.ts` | `isFresh(lastCrawledAt, now, ttlMs)` |
| `src/crawler/adapters/seed.ts` | Load embedded/local seed clinics |
| `src/crawler/adapters/htmlList.ts` | Cheerio list parser for directory + association |
| `src/crawler/adapters/clinicSite.ts` | Enrich description/languages/specialties from clinic HTML |
| `src/crawler/runCrawl.ts` | Full + incremental crawl orchestration |
| `src/crawler/blobStore.ts` | Read/write clinics payload on Vercel Blob |
| `scripts/crawl-clinics.ts` | CLI → writes `public/data/clinics.json` + meta |
| `public/data/clinics.seed.json` | Curated EU seed (starts from current clinics + more countries) |
| `public/data/clinics-meta.json` | Build-time meta |
| `src/pages/api/clinics.ts` | GET handler: serve + SWR refresh |
| `src/lib/loadClinics.ts` | Client fetch + localStorage day-cap |
| `src/components/ClinicCard.tsx` | Single clinic presentation |
| `src/components/EuClinicBrowser.tsx` | Filterable EU panel |
| `src/components/ResultsDashboard.tsx` | Wire API, country list, EU browse, disclaimer |
| `src/components/FertilityApp.tsx` | Prefetch clinics on mount/session |
| `astro.config.mjs` | `output: 'hybrid'`, Vercel adapter |
| `tests/crawler/*.test.ts` | Unit + fixture adapter tests |
| `tests/fixtures/*.html` | HTML fixtures for adapters |

---

### Task 1: Test runner + extended Clinic types

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts + deps)
- Modify: `src/lib/types.ts`
- Create: `src/crawler/types.ts`
- Create: `tests/crawler/types-smoke.test.ts`

**Interfaces:**
- Consumes: existing `Clinic` / `TreatmentType`
- Produces: extended `Clinic`; `ClinicSourceKind`; `CrawlMeta`; `ClinicsApiResponse`

- [ ] **Step 1: Add Vitest**

```bash
cd /Users/ptrck/Developer/kinderwunsch
npm install -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"crawl:clinics": "npx tsx scripts/crawl-clinics.ts"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write failing smoke test for optional clinic fields**

Create `tests/crawler/types-smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { Clinic, ClinicsApiResponse } from '../../src/lib/types';

describe('Clinic type contract', () => {
  it('allows clinics without rating or cost', () => {
    const clinic: Clinic = {
      id: 'es-demo',
      name: 'Demo Clinic',
      country: 'spain',
      countryCode: 'ES',
      city: 'Barcelona',
      website: 'https://example.com',
      specialties: ['ivf'],
      source: 'directory',
      sourceUrl: 'https://example.com/list',
      updatedAt: '2026-07-16T00:00:00.000Z',
    };
    expect(clinic.rating).toBeUndefined();
    expect(clinic.approximateCost).toBeUndefined();
  });

  it('defines API response shape', () => {
    const res: ClinicsApiResponse = {
      clinics: [],
      meta: {
        lastCrawledAt: null,
        lastPartialAt: null,
        clinicCount: 0,
        refreshing: false,
        stats: { directory: 0, association: 0, clinic_site: 0, errors: 0 },
        cursor: 0,
      },
    };
    expect(res.meta.clinicCount).toBe(0);
  });
});
```

- [ ] **Step 3: Run test — expect failure until types updated**

```bash
npm test -- tests/crawler/types-smoke.test.ts
```

Expected: FAIL (missing exports / type errors on new fields)

- [ ] **Step 4: Update `src/lib/types.ts`**

Replace `Clinic` and add response types:

```ts
export type ClinicSourceKind = 'directory' | 'association' | 'clinic_site';

export interface Clinic {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  specialties: TreatmentType[];
  countryCode: string;
  source: ClinicSourceKind;
  sourceUrl: string;
  updatedAt: string;
  rating?: number;
  approximateCost?: {
    ivf: number;
    icsi: number;
    eggDonation?: number;
    spermDonation?: number;
  };
  description?: string;
  languages?: string[];
  stale?: boolean;
}

export interface CrawlStats {
  directory: number;
  association: number;
  clinic_site: number;
  errors: number;
}

export interface CrawlMeta {
  lastCrawledAt: string | null;
  lastPartialAt: string | null;
  clinicCount: number;
  stats: CrawlStats;
  cursor: number;
}

export interface ClinicsApiResponse {
  clinics: Clinic[];
  meta: CrawlMeta & { refreshing: boolean };
}
```

Create `src/crawler/types.ts`:

```ts
import type { Clinic, ClinicSourceKind, CrawlMeta, TreatmentType } from '../lib/types';

export type { Clinic, ClinicSourceKind, CrawlMeta, TreatmentType };

export interface RawClinic {
  name: string;
  countryCode: string;
  city: string;
  website?: string;
  specialties?: TreatmentType[];
  rating?: number;
  approximateCost?: Clinic['approximateCost'];
  description?: string;
  languages?: string[];
  source: ClinicSourceKind;
  sourceUrl: string;
}

export type SourceType = 'seed' | 'directory' | 'association' | 'clinic_site';

export interface SourceEntry {
  id: string;
  type: SourceType;
  url?: string;
  path?: string;
  countryCode?: string;
  itemSelector?: string;
  nameSelector?: string;
  citySelector?: string;
  websiteAttr?: string;
  websiteSelector?: string;
  enabled?: boolean;
}

export interface ClinicsPayload {
  clinics: Clinic[];
  meta: CrawlMeta;
}

export const INCREMENTAL_BATCH_SIZE = 5;
export const CRAWL_TTL_MS = 24 * 60 * 60 * 1000;
export const FETCH_TIMEOUT_MS = 12_000;
export const CRAWLER_USER_AGENT =
  'KinderwunschFinderBot/1.0 (+https://github.com/schroepa/kinderwunsch; clinic-data-refresh)';
```

- [ ] **Step 5: Re-run tests**

```bash
npm test -- tests/crawler/types-smoke.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/types.ts src/crawler/types.ts tests/crawler/types-smoke.test.ts
git commit -m "feat: add vitest and extend Clinic types for crawler"
```

---

### Task 2: countryMap, cacheAge, normalize, dedupe (pure logic)

**Files:**
- Create: `src/crawler/countryMap.ts`
- Create: `src/crawler/cacheAge.ts`
- Create: `src/crawler/normalize.ts`
- Create: `src/crawler/dedupe.ts`
- Create: `tests/crawler/pure.test.ts`

**Interfaces:**
- Consumes: `RawClinic`, `Clinic`, `CRAWL_TTL_MS`
- Produces: `toCountrySlug()`, `toCountryCode()`, `isFresh()`, `normalizeRawClinic()`, `dedupeClinics()`

- [ ] **Step 1: Write failing tests**

Create `tests/crawler/pure.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { toCountrySlug, toCountryCode } from '../../src/crawler/countryMap';
import { isFresh } from '../../src/crawler/cacheAge';
import { normalizeRawClinic } from '../../src/crawler/normalize';
import { dedupeClinics } from '../../src/crawler/dedupe';
import { CRAWL_TTL_MS } from '../../src/crawler/types';
import type { RawClinic } from '../../src/crawler/types';

describe('countryMap', () => {
  it('maps ISO to existing recommendation slugs', () => {
    expect(toCountrySlug('DE')).toBe('germany');
    expect(toCountrySlug('CZ')).toBe('czech');
    expect(toCountrySlug('PL')).toBe('poland');
    expect(toCountrySlug('ES')).toBe('spain');
    expect(toCountrySlug('GR')).toBe('greece');
  });

  it('falls back to lowercase ISO for other EU countries', () => {
    expect(toCountrySlug('PT')).toBe('pt');
    expect(toCountryCode('germany')).toBe('DE');
  });
});

describe('isFresh', () => {
  it('is fresh within TTL', () => {
    const now = Date.parse('2026-07-16T12:00:00.000Z');
    expect(isFresh('2026-07-16T00:00:00.000Z', now, CRAWL_TTL_MS)).toBe(true);
  });

  it('is stale after TTL or when null', () => {
    const now = Date.parse('2026-07-17T13:00:00.000Z');
    expect(isFresh('2026-07-16T12:00:00.000Z', now, CRAWL_TTL_MS)).toBe(false);
    expect(isFresh(null, now, CRAWL_TTL_MS)).toBe(false);
  });
});

describe('normalize + dedupe', () => {
  it('normalizes and dedupes by website host', () => {
    const raw: RawClinic = {
      name: ' IVI Barcelona ',
      countryCode: 'es',
      city: 'Barcelona',
      website: 'https://www.ivi.es/barcelona/',
      source: 'directory',
      sourceUrl: 'https://example.com/dir',
    };
    const a = normalizeRawClinic(raw);
    const b = normalizeRawClinic({
      ...raw,
      name: 'IVI Barcelona',
      website: 'http://ivi.es/barcelona',
      description: 'Leading clinic',
      source: 'clinic_site',
    });
    const merged = dedupeClinics([a, b]);
    expect(merged).toHaveLength(1);
    expect(merged[0].description).toBe('Leading clinic');
    expect(merged[0].country).toBe('spain');
    expect(merged[0].countryCode).toBe('ES');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- tests/crawler/pure.test.ts
```

- [ ] **Step 3: Implement pure modules**

`src/crawler/countryMap.ts`:

```ts
const ISO_TO_SLUG: Record<string, string> = {
  DE: 'germany',
  CZ: 'czech',
  PL: 'poland',
  ES: 'spain',
  GR: 'greece',
};

const SLUG_TO_ISO: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_TO_SLUG).map(([iso, slug]) => [slug, iso]),
);

export function toCountrySlug(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  return ISO_TO_SLUG[code] ?? code.toLowerCase();
}

export function toCountryCode(slugOrCode: string): string {
  const key = slugOrCode.trim().toLowerCase();
  if (SLUG_TO_ISO[key]) return SLUG_TO_ISO[key];
  if (key.length === 2) return key.toUpperCase();
  return key.toUpperCase();
}
```

`src/crawler/cacheAge.ts`:

```ts
export function isFresh(
  lastCrawledAt: string | null,
  nowMs: number,
  ttlMs: number,
): boolean {
  if (!lastCrawledAt) return false;
  const then = Date.parse(lastCrawledAt);
  if (Number.isNaN(then)) return false;
  return nowMs - then < ttlMs;
}
```

`src/crawler/normalize.ts`:

```ts
import type { Clinic, RawClinic } from './types';
import { toCountrySlug } from './countryMap';

function slugifyId(name: string, countryCode: string, city: string): string {
  const base = `${countryCode}-${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base.slice(0, 80);
}

export function normalizeWebsite(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url.trim());
    u.hash = '';
    let path = u.pathname.replace(/\/+$/, '');
    if (path === '/') path = '';
    return `${u.protocol}//${u.host.toLowerCase()}${path}`;
  } catch {
    return undefined;
  }
}

export function normalizeRawClinic(raw: RawClinic, updatedAt = new Date().toISOString()): Clinic {
  const countryCode = raw.countryCode.trim().toUpperCase();
  const website =
    normalizeWebsite(raw.website) ??
    `https://unknown.invalid/${slugifyId(raw.name, countryCode, raw.city)}`;
  return {
    id: slugifyId(raw.name, countryCode, raw.city),
    name: raw.name.trim(),
    country: toCountrySlug(countryCode),
    countryCode,
    city: raw.city.trim(),
    website,
    specialties: raw.specialties ?? [],
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    updatedAt,
    rating: raw.rating,
    approximateCost: raw.approximateCost,
    description: raw.description?.trim() || undefined,
    languages: raw.languages,
  };
}
```

`src/crawler/dedupe.ts`:

```ts
import type { Clinic } from './types';
import { normalizeWebsite } from './normalize';

function fallbackKey(c: Clinic): string {
  return `${c.name.toLowerCase()}|${c.city.toLowerCase()}|${c.countryCode}`;
}

function websiteKey(c: Clinic): string | null {
  const n = normalizeWebsite(c.website);
  if (!n || n.includes('unknown.invalid')) return null;
  return n;
}

export function dedupeClinics(clinics: Clinic[]): Clinic[] {
  const byKey = new Map<string, Clinic>();

  for (const clinic of clinics) {
    const key = websiteKey(clinic) ?? fallbackKey(clinic);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, clinic);
      continue;
    }
    byKey.set(key, {
      ...existing,
      ...clinic,
      specialties: Array.from(new Set([...existing.specialties, ...clinic.specialties])),
      languages: Array.from(
        new Set([...(existing.languages ?? []), ...(clinic.languages ?? [])]),
      ),
      description: clinic.description ?? existing.description,
      rating: clinic.rating ?? existing.rating,
      approximateCost: clinic.approximateCost ?? existing.approximateCost,
      stale: clinic.stale ?? existing.stale,
      updatedAt: clinic.updatedAt > existing.updatedAt ? clinic.updatedAt : existing.updatedAt,
      source: clinic.source === 'clinic_site' ? 'clinic_site' : existing.source,
    });
  }

  return Array.from(byKey.values());
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- tests/crawler/pure.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/crawler/countryMap.ts src/crawler/cacheAge.ts src/crawler/normalize.ts src/crawler/dedupe.ts tests/crawler/pure.test.ts
git commit -m "feat: add crawler normalize, dedupe, and cache-age helpers"
```

---

### Task 3: fetchHtml + HTML list + clinic-site adapters (fixture-driven)

**Files:**
- Create: `src/crawler/fetchHtml.ts`
- Create: `src/crawler/adapters/seed.ts`
- Create: `src/crawler/adapters/htmlList.ts`
- Create: `src/crawler/adapters/clinicSite.ts`
- Create: `tests/fixtures/directory-sample.html`
- Create: `tests/fixtures/clinic-sample.html`
- Create: `tests/crawler/adapters.test.ts`
- Modify: `package.json` (add `cheerio`, `tsx`)

**Interfaces:**
- Consumes: `SourceEntry`, `RawClinic`, `fetchHtml`
- Produces: `loadSeedSource(entry)`, `parseHtmlList(html, entry)`, `enrichFromClinicHtml(html, base)`, `fetchHtml(url)`

- [ ] **Step 1: Install cheerio + tsx**

```bash
npm install cheerio
npm install -D tsx @types/node
```

- [ ] **Step 2: Add fixtures**

`tests/fixtures/directory-sample.html`:

```html
<ul class="clinics">
  <li class="clinic">
    <a class="name" href="https://www.example-ivf.pt/">Lisbon Fertility</a>
    <span class="city">Lisbon</span>
  </li>
  <li class="clinic">
    <a class="name" href="https://www.example-ivf.nl/">Amsterdam IVF</a>
    <span class="city">Amsterdam</span>
  </li>
</ul>
```

`tests/fixtures/clinic-sample.html`:

```html
<html lang="en">
  <head><meta name="description" content="IVF and ICSI treatments in English and German." /></head>
  <body>
    <h1>Lisbon Fertility</h1>
    <p>We offer IVF, ICSI and egg donation.</p>
  </body>
</html>
```

- [ ] **Step 3: Write adapter tests**

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseHtmlList } from '../../src/crawler/adapters/htmlList';
import { enrichFromClinicHtml } from '../../src/crawler/adapters/clinicSite';
import type { SourceEntry, Clinic } from '../../src/crawler/types';

const root = dirname(fileURLToPath(import.meta.url));

describe('htmlList adapter', () => {
  it('parses directory fixtures', () => {
    const html = readFileSync(join(root, '../fixtures/directory-sample.html'), 'utf8');
    const entry: SourceEntry = {
      id: 'demo-dir',
      type: 'directory',
      url: 'https://example.com/dir',
      countryCode: 'PT',
      itemSelector: 'li.clinic',
      nameSelector: 'a.name',
      citySelector: '.city',
      websiteSelector: 'a.name',
      websiteAttr: 'href',
    };
    const rows = parseHtmlList(html, entry);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Lisbon Fertility');
    expect(rows[0].website).toContain('example-ivf.pt');
    expect(rows[0].source).toBe('directory');
  });
});

describe('clinicSite adapter', () => {
  it('extracts description and specialty hints', () => {
    const html = readFileSync(join(root, '../fixtures/clinic-sample.html'), 'utf8');
    const base: Clinic = {
      id: 'pt-lisbon',
      name: 'Lisbon Fertility',
      country: 'pt',
      countryCode: 'PT',
      city: 'Lisbon',
      website: 'https://www.example-ivf.pt',
      specialties: [],
      source: 'directory',
      sourceUrl: 'https://example.com/dir',
      updatedAt: '2026-07-16T00:00:00.000Z',
    };
    const enriched = enrichFromClinicHtml(html, base);
    expect(enriched.description).toMatch(/IVF/i);
    expect(enriched.specialties).toEqual(expect.arrayContaining(['ivf', 'icsi', 'egg-donation']));
    expect(enriched.source).toBe('clinic_site');
  });
});
```

- [ ] **Step 4: Run — expect FAIL**

```bash
npm test -- tests/crawler/adapters.test.ts
```

- [ ] **Step 5: Implement adapters**

`src/crawler/fetchHtml.ts`:

```ts
import { CRAWLER_USER_AGENT, FETCH_TIMEOUT_MS } from './types';

export type FetchHtmlResult =
  | { ok: true; html: string; status: number }
  | { ok: false; status: number; error: string; skipped: boolean };

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': CRAWLER_USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (res.status === 429) {
      return { ok: false, status: 429, error: 'rate limited', skipped: true };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}`, skipped: false };
    }
    const html = await res.text();
    return { ok: true, html, status: res.status };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : 'fetch failed',
      skipped: false,
    };
  } finally {
    clearTimeout(timer);
  }
}
```

`src/crawler/adapters/htmlList.ts`:

```ts
import * as cheerio from 'cheerio';
import type { RawClinic, SourceEntry } from '../types';

export function parseHtmlList(html: string, entry: SourceEntry): RawClinic[] {
  const $ = cheerio.load(html);
  const itemSel = entry.itemSelector ?? 'li';
  const nameSel = entry.nameSelector ?? 'a';
  const citySel = entry.citySelector;
  const websiteSel = entry.websiteSelector ?? nameSel;
  const websiteAttr = entry.websiteAttr ?? 'href';
  const source = entry.type === 'association' ? 'association' : 'directory';
  const countryCode = (entry.countryCode ?? 'EU').toUpperCase();

  const rows: RawClinic[] = [];
  $(itemSel).each((_, el) => {
    const root = $(el);
    const name = root.find(nameSel).first().text().trim() || root.text().trim();
    if (!name) return;
    const city = citySel ? root.find(citySel).first().text().trim() : (entry.countryCode ?? '');
    const href = root.find(websiteSel).first().attr(websiteAttr) ?? undefined;
    let website = href;
    if (website && entry.url) {
      try {
        website = new URL(website, entry.url).toString();
      } catch {
        /* keep raw */
      }
    }
    rows.push({
      name,
      city: city || 'Unknown',
      countryCode,
      website,
      source,
      sourceUrl: entry.url ?? entry.id,
    });
  });
  return rows;
}
```

`src/crawler/adapters/clinicSite.ts`:

```ts
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
```

`src/crawler/adapters/seed.ts`:

```ts
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
```

- [ ] **Step 6: Run tests — PASS**

```bash
npm test -- tests/crawler/adapters.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/crawler/fetchHtml.ts src/crawler/adapters tests/fixtures tests/crawler/adapters.test.ts package.json package-lock.json
git commit -m "feat: add clinic HTML and seed adapters with fixtures"
```

---

### Task 4: sources allowlist + seed data + runCrawl orchestration

**Files:**
- Create: `public/data/clinics.seed.json`
- Create: `src/crawler/sources.json`
- Create: `src/crawler/runCrawl.ts`
- Create: `tests/crawler/runCrawl.test.ts`

**Interfaces:**
- Consumes: adapters, dedupe, normalize, `INCREMENTAL_BATCH_SIZE`
- Produces: `runFullCrawl(root)`, `runIncrementalBatch(payload, root)`, `loadSources()`

- [ ] **Step 1: Create seed JSON**

Copy current clinics from `public/data/clinics.json` into `public/data/clinics.seed.json`, adding required fields per entry:

- `countryCode` (`germany`→`DE`, `czech`→`CZ`, `poland`→`PL`, `spain`→`ES`, `greece`→`GR`)
- `source`: `"directory"`
- `sourceUrl`: `"public/data/clinics.seed.json"`
- `updatedAt`: `"2026-07-16T00:00:00.000Z"`

Add at least 6 additional EU clinics (PT, NL, DK, AT, IT, FR) with public homepage URLs when known.

- [ ] **Step 2: Create `src/crawler/sources.json`**

```json
[
  {
    "id": "eu-seed",
    "type": "seed",
    "path": "public/data/clinics.seed.json",
    "enabled": true
  },
  {
    "id": "enrich-from-seed-websites",
    "type": "clinic_site",
    "enabled": true
  },
  {
    "id": "example-directory-disabled",
    "type": "directory",
    "url": "https://example.com/fertility-clinics",
    "countryCode": "EU",
    "itemSelector": ".clinic",
    "nameSelector": ".name",
    "citySelector": ".city",
    "websiteSelector": "a",
    "websiteAttr": "href",
    "enabled": false
  }
]
```

Enable live directory/association URLs only after selectors are verified. Do not ship broken scrapers enabled.

- [ ] **Step 3: Write runCrawl tests with mocked fetch**

```ts
import { describe, it, expect, vi } from 'vitest';
import { runIncrementalBatch } from '../../src/crawler/runCrawl';
import type { ClinicsPayload } from '../../src/crawler/types';

vi.mock('../../src/crawler/fetchHtml', () => ({
  fetchHtml: vi.fn(async () => ({
    ok: true,
    status: 200,
    html: `<html><head><meta name="description" content="IVF clinic" /></head><body><p>IVF</p></body></html>`,
  })),
}));

describe('runIncrementalBatch', () => {
  it('advances cursor and sets lastPartialAt', async () => {
    const payload: ClinicsPayload = {
      clinics: [
        {
          id: 'a',
          name: 'A',
          country: 'spain',
          countryCode: 'ES',
          city: 'Barcelona',
          website: 'https://www.ivi.es',
          specialties: [],
          source: 'directory',
          sourceUrl: 'seed',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      ],
      meta: {
        lastCrawledAt: null,
        lastPartialAt: null,
        clinicCount: 1,
        stats: { directory: 1, association: 0, clinic_site: 0, errors: 0 },
        cursor: 0,
      },
    };
    const next = await runIncrementalBatch(payload, process.cwd());
    expect(next.meta.cursor).toBeGreaterThanOrEqual(0);
    expect(next.meta.lastPartialAt).toBeTruthy();
    expect(next.clinics[0].description || next.clinics[0].specialties.length).toBeTruthy();
  });
});
```

- [ ] **Step 4: Implement `src/crawler/runCrawl.ts`**

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadSeedSource } from './adapters/seed';
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
```

- [ ] **Step 5: Run tests**

```bash
npm test -- tests/crawler/runCrawl.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add public/data/clinics.seed.json src/crawler/sources.json src/crawler/runCrawl.ts tests/crawler/runCrawl.test.ts
git commit -m "feat: add allowlist sources and crawl orchestration"
```

---

### Task 5: CLI write to public JSON

**Files:**
- Create: `scripts/crawl-clinics.ts`
- Modify: `public/data/clinics.json`
- Create: `public/data/clinics-meta.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: `runFullCrawl`
- Produces: updated static JSON files on disk

- [ ] **Step 1: Implement CLI**

```ts
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runFullCrawl } from '../src/crawler/runCrawl';

const root = process.cwd();

async function main() {
  console.log('Crawling clinics (allowlist)...');
  const payload = await runFullCrawl(root);
  await writeFile(
    join(root, 'public/data/clinics.json'),
    JSON.stringify(payload.clinics, null, 2) + '\n',
    'utf8',
  );
  await writeFile(
    join(root, 'public/data/clinics-meta.json'),
    JSON.stringify(payload.meta, null, 2) + '\n',
    'utf8',
  );
  console.log(`Wrote ${payload.clinics.length} clinics`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run crawl**

```bash
npm run crawl:clinics
```

Expected: writes JSON; enrichment failures are OK (`stale`).

- [ ] **Step 3: Document in README**

```markdown
## Klinik-Daten aktualisieren

\`\`\`bash
npm run crawl:clinics
\`\`\`

Schreibt `public/data/clinics.json` und `public/data/clinics-meta.json` aus der Allowlist in `src/crawler/sources.json`.
```

- [ ] **Step 4: Commit**

```bash
git add scripts/crawl-clinics.ts public/data/clinics.json public/data/clinics-meta.json README.md
git commit -m "feat: add crawl:clinics CLI and refresh static clinic data"
```

---

### Task 6: Vercel hybrid + Blob store + API route

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json`
- Modify: `src/pages/index.astro` (`export const prerender = true`)
- Create: `src/crawler/blobStore.ts`
- Create: `src/pages/api/clinics.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes: `isFresh`, `runIncrementalBatch`, Blob read/write
- Produces: `GET /api/clinics` → `ClinicsApiResponse`

- [ ] **Step 1: Install adapter + blob**

```bash
npm install @astrojs/vercel @vercel/blob
```

- [ ] **Step 2: Update `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
});
```

Add at top of `src/pages/index.astro`:

```ts
export const prerender = true;
```

- [ ] **Step 3: Implement `src/crawler/blobStore.ts`**

```ts
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
```

- [ ] **Step 4: API route `src/pages/api/clinics.ts`**

```ts
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
```

SWR returns the pre-batch payload. The next request reads the updated Blob.

- [ ] **Step 5: `.env.example`**

```
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 6: Smoke-test API locally**

```bash
npm run build
npm run preview
curl -s http://localhost:4321/api/clinics | head -c 200
```

Or with `npm run dev`. Expected: JSON with `clinics` and `meta`.

- [ ] **Step 7: Commit**

```bash
git add astro.config.mjs src/pages/api/clinics.ts src/crawler/blobStore.ts src/pages/index.astro .env.example package.json package-lock.json
git commit -m "feat: add Vercel hybrid API for clinics with Blob cache"
```

---

### Task 7: Client loader + FertilityApp prefetch

**Files:**
- Create: `src/lib/loadClinics.ts`
- Modify: `src/components/FertilityApp.tsx`

**Interfaces:**
- Consumes: `ClinicsApiResponse`
- Produces: `loadClinics({ force })`, `shouldPrefetchOnMount()`

- [ ] **Step 1: Implement `src/lib/loadClinics.ts`**

```ts
import type { ClinicsApiResponse } from './types';

const CHECKED_KEY = 'clinicsCheckedAt';
const SESSION_KEY = 'clinicsSessionLoaded';
const DAY_MS = 24 * 60 * 60 * 1000;

export async function loadClinics(options?: { force?: boolean }): Promise<ClinicsApiResponse> {
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && typeof localStorage !== 'undefined') {
    const checked = Number(localStorage.getItem(CHECKED_KEY) ?? '0');
    if (checked && now - checked < DAY_MS) {
      const cached = sessionStorage.getItem('clinicsPayload');
      if (cached) return JSON.parse(cached) as ClinicsApiResponse;
    }
  }

  const res = await fetch('/api/clinics');
  if (!res.ok) {
    const fallback = await fetch('/data/clinics.json');
    const clinics = await fallback.json();
    return {
      clinics,
      meta: {
        lastCrawledAt: null,
        lastPartialAt: null,
        clinicCount: clinics.length,
        refreshing: false,
        stats: { directory: 0, association: 0, clinic_site: 0, errors: 0 },
        cursor: 0,
      },
    };
  }

  const data = (await res.json()) as ClinicsApiResponse;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CHECKED_KEY, String(now));
    sessionStorage.setItem('clinicsPayload', JSON.stringify(data));
    sessionStorage.setItem(SESSION_KEY, '1');
  }
  return data;
}

export function shouldPrefetchOnMount(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(SESSION_KEY) !== '1';
}
```

- [ ] **Step 2: Wire `FertilityApp`**

```tsx
import { useEffect } from 'react';
import { loadClinics, shouldPrefetchOnMount } from '../lib/loadClinics';

// inside FertilityApp component:
useEffect(() => {
  if (shouldPrefetchOnMount()) {
    void loadClinics({ force: false });
  }
}, []);
```

- [ ] **Step 3: Manual check** — Network tab shows `/api/clinics` once per cold session.

- [ ] **Step 4: Commit**

```bash
git add src/lib/loadClinics.ts src/components/FertilityApp.tsx
git commit -m "feat: prefetch clinics via API on app session start"
```

---

### Task 8: UI — ClinicCard, EuClinicBrowser, ResultsDashboard hybrid

**Files:**
- Create: `src/components/ClinicCard.tsx`
- Create: `src/components/EuClinicBrowser.tsx`
- Modify: `src/components/ResultsDashboard.tsx`

**Interfaces:**
- Consumes: `loadClinics`, `Clinic`, meta timestamps
- Produces: hybrid UI with stand date + disclaimer

- [ ] **Step 1: Create `ClinicCard.tsx`**

```tsx
import type { Clinic } from '../lib/types';

export function ClinicCard({ clinic, standLabel }: { clinic: Clinic; standLabel?: string }) {
  return (
    <div className="bg-muted/50 p-3 rounded-md space-y-1">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium">{clinic.name}</div>
          <div className="text-sm text-muted-foreground">
            {clinic.city}
            {standLabel ? ` · Stand: ${standLabel}` : ''}
            {clinic.stale ? ' · Daten veraltet' : ''}
          </div>
        </div>
        <div className="text-sm font-semibold text-primary">
          {clinic.rating != null ? `⭐ ${clinic.rating}` : 'k. A.'}
        </div>
      </div>
      {clinic.description && <p className="text-xs text-muted-foreground">{clinic.description}</p>}
      {clinic.specialties.length > 0 && (
        <div className="text-xs text-muted-foreground">{clinic.specialties.join(', ')}</div>
      )}
      {clinic.approximateCost ? (
        <div className="text-xs text-muted-foreground">
          IVF: ~{clinic.approximateCost.ivf.toLocaleString('de-DE')} € | ICSI: ~
          {clinic.approximateCost.icsi.toLocaleString('de-DE')} €
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">Kosten: k. A.</div>
      )}
      <a
        href={clinic.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Website besuchen →
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Create `EuClinicBrowser.tsx`**

```tsx
import { useMemo, useState } from 'react';
import type { Clinic } from '../lib/types';
import { ClinicCard } from './ClinicCard';

export function EuClinicBrowser({
  clinics,
  standLabel,
  open,
  onClose,
}: {
  clinics: Clinic[];
  standLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const countries = useMemo(
    () => Array.from(new Set(clinics.map((c) => c.countryCode))).sort(),
    [clinics],
  );
  const filtered = clinics.filter((c) => {
    if (country !== 'all' && c.countryCode !== country) return false;
    return `${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase());
  });

  if (!open) return null;

  return (
    <div className="mt-8 border-t pt-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Alle EU-Kliniken durchsuchen</h3>
          <p className="text-sm text-muted-foreground">
            Stand: {standLabel} · {filtered.length} Treffer
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-primary">
          Schließen
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="border rounded-md px-3 py-2 text-sm flex-1"
          placeholder="Name oder Stadt…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="all">Alle Länder</option>
          {countries.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filtered.map((c) => (
          <ClinicCard key={c.id} clinic={c} standLabel={standLabel} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update `ResultsDashboard.tsx`**

1. Import `loadClinics`, `ClinicCard`, `EuClinicBrowser`.
2. Add state: `browseOpen`, `standLabel`, `metaRefreshing`.
3. Replace the clinics `fetch('/data/clinics.json')` effect body with:

```tsx
async function refreshClinics(force: boolean) {
  const data = await loadClinics({ force });
  setClinics(data.clinics);
  const stamp = data.meta.lastCrawledAt ?? data.meta.lastPartialAt;
  setStandLabel(stamp ? new Date(stamp).toLocaleDateString('de-DE') : 'Build-Daten');
  setMetaRefreshing(data.meta.refreshing);
}

useEffect(() => {
  const recs = getCountryRecommendations(userData);
  setRecommendations(recs);
  void refreshClinics(false);
}, [userData]);
```

4. Change the Kliniken button `onClick` to force-refresh when opening:

```tsx
onClick={() => {
  const next = selectedCountry === country.id ? null : country.id;
  setSelectedCountry(next);
  if (next) void refreshClinics(true);
}}
```

5. Replace the inline clinic card markup with `<ClinicCard clinic={clinic} standLabel={standLabel} />`.
6. After the recommendations grid, add:

```tsx
<p className="text-xs text-muted-foreground">
  Angaben ohne Gewähr; bitte bei der Klinik bestätigen.
  {metaRefreshing ? ' · Aktualisierung läuft…' : ''}
</p>
<button
  type="button"
  className="px-4 py-2 border rounded-md text-sm font-medium"
  onClick={() => {
    setBrowseOpen(true);
    void refreshClinics(true);
  }}
>
  Alle EU-Kliniken durchsuchen
</button>
<EuClinicBrowser
  open={browseOpen}
  onClose={() => setBrowseOpen(false)}
  clinics={clinics}
  standLabel={standLabel}
/>
```

- [ ] **Step 4: Manual UI verify at http://localhost:4321/**

- [ ] **Step 5: Commit**

```bash
git add src/components/ClinicCard.tsx src/components/EuClinicBrowser.tsx src/components/ResultsDashboard.tsx
git commit -m "feat: hybrid clinic UI with EU browse and freshness stamp"
```

---

### Task 9: Harden for production + final verification

**Files:**
- Modify: `README.md` (Vercel Blob setup)

- [ ] **Step 1: README deploy notes**

```markdown
## Deployment (Vercel)

1. Framework: Astro (hybrid)
2. Env: `BLOB_READ_WRITE_TOKEN` from a Vercel Blob store
3. Optional CI step: `npm run crawl:clinics` before build
4. Without Blob token, API falls back to `public/data/clinics.json`
```

- [ ] **Step 2: Full test + build**

```bash
npm test
npm run crawl:clinics
npm run build
```

Expected: tests pass; build succeeds.

- [ ] **Step 3: Fix any `astro check` / TS errors** (especially optional `approximateCost` / `rating`).

- [ ] **Step 4: Final commit**

```bash
git add README.md src
git commit -m "docs: document clinic crawler deploy and verify build"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Allowlist adapters (directory/association/clinic_site) | 3–4 |
| Seed + EU coverage | 4 |
| Extended Clinic model | 1 |
| Dedupe / normalize | 2 |
| Build CLI `crawl:clinics` | 5 |
| `/api/clinics` + 24h SWR + incremental batch | 6 |
| Blob + JSON fallback | 6 |
| Client triggers + localStorage day-cap | 7–8 |
| Hybrid UI + disclaimer + stand | 8 |
| Error resilience (429, stale keep) | 3, 4, 6 |
| Vitest coverage | 1–4 |
| Vercel hybrid hosting | 6, 9 |

## Out of scope (do not implement in this plan)

- Map view, reviews, open discovery, Places APIs
