# Phase 3: Klinikvolumen (Hybrid) — Design

**Date:** 2026-07-18  
**Status:** Approved for implementation planning  
**Product:** Roser (`roser.vercel.app`)  
**Related:**  
- Parent roadmap: `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` (Phase 3)  
- Crawler architecture: `docs/superpowers/specs/2026-07-16-clinic-crawler-design.md`

## Goal

Offer a **larger selection of European fertility clinics** while preserving trust: the hand-curated seed remains the quality core; allowlisted directory/association sources add volume; the UI makes provenance and missing fields obvious.

## Non-goals

- Open-ended web crawling or search-engine scraping  
- Inventing costs, ratings, or success rates  
- User-generated reviews as truth  
- Guaranteed freshness of directory-only cost fields  
- Paid Places APIs as primary source (optional later)

## Chosen approach (Option 3 — hybrid, parallel)

| Layer | Role |
|-------|------|
| **Seed (Trusted Core)** | Expand `public/data/clinics.seed.json` toward ~50–60 clinics with richer fields where known |
| **Allowlist directories** | Enable 2–3 HTML list sources in `sources.json` (or static directory packs if live HTML is not parseable) |
| **Enrichment** | Existing `clinic_site` adapter fills description/specialties when websites allow |
| **UI provenance** | Badges **Kuratiert** vs. **Aus Verzeichnis** (and association if used); keep **Daten veraltet** |
| **Dedup** | Existing host + name/city/countryCode rules |

Target after first ship: **≥50 clinics** in `clinics.json` / live API payload (exact count depends on source yield).

## Data model

### Provenance (new)

Distinguish curated seed from scraped lists. Today seed rows are incorrectly tagged `source: 'directory'`.

**Add** to `Clinic` (and crawl raw → normalize):

```ts
provenance: 'curated' | 'directory' | 'association';
```

Mapping:

| Origin | `provenance` | `source` (existing) |
|--------|----------------|---------------------|
| Seed file | `curated` | keep `directory` *or* introduce `curated` source kind — prefer explicit `provenance` and leave `source` as crawl channel |
| HTML directory adapter | `directory` | `directory` |
| Association adapter | `association` | `association` |
| Website enrichment | unchanged provenance | may set `source` enrichment stats only |

Backward compatible: if `provenance` missing at runtime, treat `sourceUrl` containing `clinics.seed` / seed id as curated; else directory.

### Completeness (UI only — no fake data)

Missing `approximateCost`, `description`, `rating` → show „k. A.“ / omit sections; never invent values. Directory rows may ship name + city + website only.

### Coordinates

Reuse `attachClinicCoords` / city table; extend city table when new cities appear. Missing coords → map caption already explains omissions.

## Sources

### Seed expansion

- Prioritize countries with sparse coverage today (DE, AT, NL, DK, FR, IT, PT) and deepen CZ/PL/ES/GR  
- Prefer clinics with public websites; note approximate costs only from attributable public pages or leave blank  
- Keep medical disclaimer; no “recommended” language

### Directory / association allowlist

Candidates (validate HTML structure during implementation; disable if JS-only or ToS-hostile):

1. National association or public register list pages (DE / CZ / ES / PL — pick 2 that parse with Cheerio)  
2. Optional third EU-wide or regional directory with stable list markup  

If live fetch is unreliable: commit a **static directory pack** JSON (manually transcribed from a named public list, dated) loaded as `type: 'seed'`-like file but with `provenance: 'directory'` and documented `sourceUrl` / attribution in meta or per-row `sourceUrl`.

**Rules (unchanged crawler design):**

- Only URLs in `sources.json`  
- Respectful User-Agent, delays, skip on 429  
- No automatic discovery of new domains  

## UI

### ClinicCard / directory / results

- Badge next to meta: **Kuratiert** (primary/muted chip) vs. **Aus Verzeichnis** (secondary chip)  
- Association → **Verband / Register** (optional short label)  
- Incomplete directory cards: identity + website CTA primary; costs block only if present  
- Disclaimer unchanged: Angaben ohne Gewähr  

### Filters / map

No change to filter semantics; larger list must remain filterable. Map shows markers for clinics with coords.

## Pipeline

1. Expand seed → run `npm run crawl:clinics` (or write both seed + `clinics.json`)  
2. Enable directory sources / packs → merge + dedupe  
3. Enrich websites in batch (existing loop; rate-limit)  
4. Attach coords on load  
5. UI badges from `provenance`

Build and `/api/clinics` continue to serve merged payload; Blob SWR unchanged.

## Testing

- Unit: provenance mapping from seed vs directory raw  
- Adapter: fixture HTML → N clinics with expected countryCode  
- Dedupe: seed + directory duplicate website → one row, prefer curated fields  
- UI: badge text for curated vs directory  
- Acceptance: `clinicCount >= 50` after crawl (or document shortfall + follow-up sources)

## Success criteria

- [ ] ≥50 clinics available in app data (or documented blocker with ≥1 live directory source + expanded seed)  
- [ ] Provenance badges on ClinicCard  
- [ ] No invented costs/ratings  
- [ ] Crawl meta/stats still meaningful  
- [ ] Seed remains editable trusted core  

## Out of scope (follow-ups)

- CMS for clinic editing  
- Crowdsourced updates  
- Route/travel times on map  
- Multi-page directory pagination crawlers (v2 if needed)

## Open questions (non-blocking)

- Exact first 2 directory URLs (resolved in plan Task 1 with fixtures)  
- Whether to rename seed `source` away from `directory` (prefer `provenance` field only to minimize churn)
