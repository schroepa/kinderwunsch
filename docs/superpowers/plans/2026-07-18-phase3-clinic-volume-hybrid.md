# Phase 3: Klinikvolumen (Hybrid) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow Roser’s clinic catalogue to ≥50 entries via expanded curated seed plus allowlisted directory data, and show clear **Kuratiert** / **Aus Verzeichnis** provenance in the UI without inventing costs or ratings.

**Architecture:** Keep the existing allowlist crawler (`runCrawl`, Cheerio adapters, dedupe, `/api/clinics`). Add `provenance` on `Clinic`. Expand `clinics.seed.json`. Enable 2–3 directory sources (live HTML or dated static packs). ClinicCard reads provenance for badges. Coords continue via `attachClinicCoords`.

**Tech Stack:** Existing Astro/React app, Cheerio crawler, Vitest, Vercel Blob API path unchanged

**Spec:** `docs/superpowers/specs/2026-07-18-phase3-clinic-volume-hybrid-design.md`

## Global Constraints

- German UI copy for badges: **Kuratiert**, **Aus Verzeichnis** (optional **Verband / Register**)
- Never invent `approximateCost`, `rating`, or success rates
- Allowlist only — no open crawl
- Target **≥50** clinics after merge (document if a source under-delivers)
- Preserve medical disclaimer
- Seed remains trusted core (richer fields preferred on conflict)
- Tests: `npm test`; crawl script must not wipe curated costs when deduping
- Product name: Roser

### Deferred

- Pagination crawlers for multi-page directories  
- CMS / admin editing  
- Paid geocoding APIs  

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/lib/types.ts` | Add `ClinicProvenance` + `provenance?` on `Clinic` |
| `src/crawler/types.ts` | RawClinic `provenance?` |
| `src/crawler/normalize.ts` | Pass/default provenance |
| `src/crawler/adapters/seed.ts` | Set `provenance: 'curated'` |
| `src/crawler/adapters/htmlList.ts` | Set provenance from entry type |
| `src/crawler/dedupe.ts` | Prefer curated fields when merging duplicates |
| `src/crawler/sources.json` | Enable real directory sources / packs |
| `public/data/clinics.seed.json` | Expanded curated clinics (~50–60 target contribution) |
| `public/data/clinics.json` | Regenerated crawl output |
| `public/data/directory-packs/*.json` (optional) | Static directory lists if HTML scrape fails |
| `src/lib/cityCoordinates.ts` | New cities from seed/directory |
| `src/components/ClinicCard.tsx` | Provenance badge + incomplete-state layout |
| `tests/lib/clinicProvenance.test.ts` (or crawler tests) | Provenance + dedupe preference |
| `tests/crawler/htmlList.*.ts` | Fixture → clinics |
| `README.md` | Short note on seed vs directory |

---

### Task 1: Provenance model + dedupe preference (TDD)

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/crawler/types.ts`, `normalize.ts`, `adapters/seed.ts`, `adapters/htmlList.ts`, `dedupe.ts`
- Create: `tests/crawler/provenance.test.ts` (or under `tests/lib/`)

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeRawClinic } from '../../src/crawler/normalize';
import { dedupeClinics } from '../../src/crawler/dedupe';
import { parseHtmlList } from '../../src/crawler/adapters/htmlList';

describe('clinic provenance', () => {
  it('marks seed-normalized clinics as curated when provenance set on raw', () => {
    const c = normalizeRawClinic({
      name: 'Test Klinik',
      city: 'Berlin',
      countryCode: 'DE',
      website: 'https://example.org',
      source: 'directory',
      sourceUrl: 'public/data/clinics.seed.json',
      provenance: 'curated',
    });
    expect(c.provenance).toBe('curated');
  });

  it('parseHtmlList sets directory provenance', () => {
    const html = `<ul><li class="clinic"><a class="name" href="https://a.example">A</a><span class="city">Prag</span></li></ul>`;
    const rows = parseHtmlList(html, {
      id: 't',
      type: 'directory',
      url: 'https://dir.example/list',
      countryCode: 'CZ',
      itemSelector: 'li.clinic',
      nameSelector: 'a.name',
      citySelector: '.city',
      websiteSelector: 'a.name',
      enabled: true,
    });
    expect(rows[0]?.provenance).toBe('directory');
  });

  it('dedupe prefers curated approximateCost over directory empty', () => {
    const curated = normalizeRawClinic({
      name: 'Same',
      city: 'Berlin',
      countryCode: 'DE',
      website: 'https://same.example',
      source: 'directory',
      sourceUrl: 'seed',
      provenance: 'curated',
      approximateCost: { ivf: 3500, icsi: 4500 },
    });
    const fromDir = normalizeRawClinic({
      name: 'Same',
      city: 'Berlin',
      countryCode: 'DE',
      website: 'https://same.example',
      source: 'directory',
      sourceUrl: 'https://dir.example',
      provenance: 'directory',
    });
    const [merged] = dedupeClinics([fromDir, curated]);
    expect(merged.provenance).toBe('curated');
    expect(merged.approximateCost?.ivf).toBe(3500);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- tests/crawler/provenance.test.ts
```

- [ ] **Step 3: Implement provenance plumbing**

Add to `Clinic`:

```ts
export type ClinicProvenance = 'curated' | 'directory' | 'association';
// on Clinic:
provenance?: ClinicProvenance;
```

- Seed adapter: `provenance: 'curated'`  
- `htmlList`: `provenance: entry.type === 'association' ? 'association' : 'directory'`  
- `normalizeRawClinic`: copy `raw.provenance`  
- `dedupeClinics`: when merging, if either is curated → result curated; prefer non-null cost/description/rating from curated side

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/crawler/ tests/crawler/provenance.test.ts
git commit -m "feat: add clinic provenance and prefer curated on dedupe"
```

---

### Task 2: Expand curated seed toward volume

**Files:**
- Modify: `public/data/clinics.seed.json`
- Modify: `src/lib/cityCoordinates.ts` (any new cities)
- Modify: `tests/lib/cityCoordinates.test.ts` if new keys

- [ ] **Step 1: Audit current seed**

```bash
node -e "const d=require('./public/data/clinics.seed.json'); console.log(d.length); console.log([...new Set(d.map(c=>c.countryCode))].sort())"
```

- [ ] **Step 2: Add curated clinics**

Add rows until seed alone is ~40–60 **or** seed + planned directory packs clearly reach ≥50. Requirements per row:

- `name`, `city`, `countryCode`, `website`, `specialties` (best effort)
- `approximateCost` / `rating` / `description` only if attributable; else omit
- Stable `id` pattern consistent with existing ids
- Optional `lat`/`lng` or rely on city table

Prioritize sparse countries: DE, AT, NL, DK, FR, IT, PT.

- [ ] **Step 3: Extend `CITY_COORDS` for every new city|CC pair**

- [ ] **Step 4: Tests for new city lookups**

- [ ] **Step 5: Commit**

```bash
git add public/data/clinics.seed.json src/lib/cityCoordinates.ts tests/lib/cityCoordinates.test.ts
git commit -m "feat: expand curated clinic seed for Phase 3 volume"
```

---

### Task 3: Directory sources — research, fixtures, enable

**Files:**
- Modify: `src/crawler/sources.json`
- Create: `tests/fixtures/crawler/*.html` (saved list markup)
- Create (optional): `public/data/directory-packs/<id>.json` + seed-like loader path **or** reuse seed adapter with provenance override
- Modify: crawler if static pack type needed (`type: 'directory_pack'` with `path`)

- [ ] **Step 1: Pick 2 sources**

Validate each candidate:

1. Public list URL returns HTML with repeating clinic items (View Source / curl)  
2. Selectors stable enough for Cheerio  
3. Legal/ToS: public listing, respectful crawl  

If scrape fails → build `directory-packs/cz-public-list.json` (etc.) with `provenance: 'directory'` and `sourceUrl` = citation URL + access date in file header comment or `_meta`.

- [ ] **Step 2: Save HTML fixture + adapter test**

```bash
npm test -- tests/crawler/
```

- [ ] **Step 3: Enable entries in `sources.json`**

Example shape:

```json
{
  "id": "cz-example-directory",
  "type": "directory",
  "url": "https://…",
  "countryCode": "CZ",
  "itemSelector": "…",
  "nameSelector": "…",
  "citySelector": "…",
  "websiteSelector": "…",
  "websiteAttr": "href",
  "enabled": true
}
```

- [ ] **Step 4: Run crawl locally**

```bash
npm run crawl:clinics
node -e "const d=require('./public/data/clinics.json'); console.log('count', d.length)"
```

Expect `length >= 50` (or write shortfall note in README / plan checklist).

- [ ] **Step 5: Commit**

```bash
git add src/crawler/sources.json tests/fixtures public/data/clinics.json public/data/directory-packs
git commit -m "feat: enable allowlisted directory sources for clinic volume"
```

---

### Task 4: UI badges + incomplete directory cards

**Files:**
- Modify: `src/components/ClinicCard.tsx`
- Optional helper: `src/lib/clinicProvenance.ts` → `provenanceLabel(clinic)`

- [ ] **Step 1: Helper**

```ts
export function resolveProvenance(clinic: Clinic): 'curated' | 'directory' | 'association' {
  if (clinic.provenance) return clinic.provenance;
  if (clinic.sourceUrl?.includes('clinics.seed')) return 'curated';
  if (clinic.source === 'association') return 'association';
  return 'directory';
}

export function provenanceLabel(p: ReturnType<typeof resolveProvenance>): string {
  switch (p) {
    case 'curated': return 'Kuratiert';
    case 'association': return 'Verband / Register';
    default: return 'Aus Verzeichnis';
  }
}
```

- [ ] **Step 2: ClinicCard badge**

Place near location/stand meta (not a floating hero sticker): muted chip, warning style only for `stale`.

- [ ] **Step 3: Incomplete layout**

If no `approximateCost`, keep the existing „Keine Angabe“ / omit price hero; do not show empty fake rows. CTA **Website besuchen** remains primary for directory-thin rows.

- [ ] **Step 4: Manual check**

`/kliniken` list: mix of badges; filter still works; map unaffected.

- [ ] **Step 5: Commit**

```bash
git add src/components/ClinicCard.tsx src/lib/clinicProvenance.ts
git commit -m "feat: show curated vs directory provenance on clinic cards"
```

---

### Task 5: Docs, README, acceptance gate

**Files:**
- Modify: `README.md` (seed vs directory, crawl command)
- Modify: parent roadmap checkboxes in `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` Phase 3 acceptance if done

- [ ] **Step 1: Document**

- How to add a curated clinic  
- How to add an allowlist source  
- That directory costs may be missing  

- [ ] **Step 2: Full test + build**

```bash
npm test
npm run build
```

- [ ] **Step 3: Acceptance**

- [ ] `clinicCount >= 50`  
- [ ] Badges visible  
- [ ] No invented costs  
- [ ] Meta/stats present after crawl  

- [ ] **Step 4: Commit**

```bash
git add README.md docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md
git commit -m "docs: Phase 3 clinic volume acceptance and crawl notes"
```

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-18-phase3-clinic-volume-hybrid.md`.

**Two execution options:**

1. **Subagent-driven (recommended)** — `superpowers:subagent-driven-development`  
2. **Inline** — `superpowers:executing-plans`

Which do you prefer?
