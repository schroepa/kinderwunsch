# Clinic Crawler Design — Allowlist + Cache (Build + Vercel)

**Date:** 2026-07-16  
**Status:** Approved for implementation planning  
**App:** Kinderwunsch-Finder (`ivf-fertility-finder`)

## Goal

Combine three data source types (public directories, association/register pages, clinic websites) to present **current European fertility clinics** in the app. Data refreshes at **build time** and on **app usage**, with a **maximum of one server-side crawl cycle per 24 hours**.

## Non-goals

- Open-ended web crawling (no unrestricted discovery)
- Full Europe crawl in a single Vercel request
- Guaranteed medical accuracy of costs/ratings (disclaimer required)
- Replacing the country-recommendation scoring logic

## Chosen approach

**Allowlist crawler + cache (Approach 1):** curated source adapters, build-time JSON, Vercel API with Blob/KV cache, stale-while-revalidate, incremental refresh batches.

## Architecture

```
Build-time                         Runtime (Vercel)
─────────                          ────────────────
Source adapters ──┐
 (directories,    │
  associations,   ├──► public/data/clinics.json + meta
  clinic sites)   │           │
npm run           │           ▼
  crawl:clinics ──┘    Vercel Blob (live cache)
                              │
                    GET /api/clinics ← Client
                              │
                    if cache age > 24h:
                    incremental background refresh
```

### Components

| Unit | Responsibility | Depends on |
|------|----------------|------------|
| `ClinicSource` adapters | Fetch + parse one allowlisted source | HTTP fetch, fixtures |
| Normalizer / deduper | Map to `Clinic`, merge duplicates | Adapter output |
| `crawl:clinics` CLI | Full (or large) crawl at build | Adapters, filesystem |
| `GET /api/clinics` | Serve cache; trigger refresh if stale | Blob, fallback JSON |
| Client clinic loader | Trigger checks on load / session / expand | API + localStorage |
| `ResultsDashboard` UI | Country clinics + EU browse (hybrid) | Clinic loader |

## Data model

Extend existing `Clinic` (backward compatible):

**Existing:** `id`, `name`, `country`, `city`, `rating`, `website`, `specialties[]`, `approximateCost`

**New:**

- `countryCode` — ISO 3166-1 alpha-2
- `source` — `directory` | `association` | `clinic_site`
- `sourceUrl` — URL of the record origin
- `updatedAt` — ISO timestamp of last successful parse
- `description?` — short text from clinic site when available
- `languages?[]` — if extractable
- `stale?` — true if last enrichment failed but prior data kept

**Meta** (`meta` alongside clinics or separate `clinics-meta.json`):

- `lastCrawledAt` — end of last full/completed cycle
- `lastPartialAt` — last incremental batch
- `stats` — counts per source type, error counts
- `cursor` — round-robin position for incremental EU refresh

### Deduplication

Primary key preference: normalized `website` host+path; fallback `name` + `city` + `countryCode`.

### Rating / cost

Only include when the source provides them reliably; otherwise omit or show „k. A.“ in UI. Do not invent values.

## Sources (allowlist)

Three adapter types, Europe-wide:

1. **Directories** — curated fertility portal / clinic list pages → name, country, city, website  
2. **Associations** — public national/EU association or register pages → name, location, optional accreditation  
3. **Clinic websites** — URLs discovered from (1)/(2) → description, specialties, languages  

**Rules:**

- Only URLs on an explicit allowlist (config file, e.g. `src/crawler/sources.json`)
- Respectful `User-Agent`, delays, retries; skip source for cycle on HTTP 429
- Prefer robots-compliant access where practical
- Seed list starts with known EU countries; expand allowlist over time (not open crawl)

Initial seed may include the current demo clinics in `public/data/clinics.json` as clinic_site targets plus documented directory/association URLs added during implementation.

## Crawl pipeline & refresh

### Build (`npm run crawl:clinics`)

1. Run allowlisted adapters with rate limiting  
2. Merge + dedupe  
3. Optional website enrichment batch for missing descriptions  
4. Write `public/data/clinics.json` and meta  
5. Suitable to run before `astro build` / in CI  

### Runtime (`GET /api/clinics`)

1. Read Blob cache; if missing → serve build-time JSON  
2. If `now - lastCrawledAt < 24h` → return cache (no refresh)  
3. If stale → **stale-while-revalidate**: return current cache immediately; kick off **incremental** refresh (next N sources/clinics via `cursor`, round-robin across Europe)  
4. Update Blob after batch; advance `cursor`; set `lastCrawledAt` when a full cycle completes, else `lastPartialAt`  

Response shape (illustrative):

```json
{
  "clinics": [ /* Clinic[] */ ],
  "meta": {
    "lastCrawledAt": "...",
    "lastPartialAt": "...",
    "refreshing": false,
    "clinicCount": 0
  }
}
```

### Client triggers

Events that may call the API:

- App page load  
- New browser session  
- Click „Kliniken anzeigen“  

**Cache discipline:**

- Server: after a **completed** cycle (`lastCrawledAt`), no new crawl for 24h. While stale, multiple requests may each run one incremental batch until the cycle finishes (guard with an in-flight lock so batches do not overlap).  
- Client `localStorage` key `clinicsCheckedAt`: avoid redundant API polling within 24h on mere page load/session; **„Kliniken anzeigen“** always hits the API (server still enforces crawl freshness)  
- Show „Stand: …“ from `lastCrawledAt` (or `lastPartialAt` if more recent and full cycle incomplete)

Browser never crawls; only calls `/api/clinics`.

## UI (Hybrid C)

1. **Per country (existing flow):** Expanding a recommended country lists clinics for that country, enriched (description, specialties, stand date, link).  
2. **EU browse:** Control „Alle EU-Kliniken durchsuchen“ opens a filterable panel (country filter, search by name/city) over the full Europe dataset.  
3. Disclaimer near clinic lists: Angaben ohne Gewähr; bitte bei der Klinik bestätigen.  

Keep existing shadcn/card patterns; no separate marketing redesign required for v1.

## Hosting

- Deploy on **Vercel**  
- Astro API route (serverless) for `/api/clinics`  
- Persist live cache in **Vercel Blob** (preferred for JSON blob) or KV if already provisioned  
- Env: `BLOB_READ_WRITE_TOKEN` (or equivalent); document in README  

## Error handling

| Failure | Behavior |
|---------|----------|
| Source timeout / down | Keep prior clinic rows; count error in meta |
| API / Blob unavailable | Fallback to `public/data/clinics.json` |
| Partial refresh fails | Keep previous cache; no empty response |
| HTTP 429 | Skip that source for this cycle |
| Vercel time limit | Batch only; never full EU in one invocation |

## Testing

- **Unit:** dedupe, normalizer, cache age (&lt;/&gt; 24h), cursor advance  
- **Adapter:** fixture HTML → expected clinic records  
- **API:** fresh cache → no refresh flag; stale → 200 + `refreshing` / background path  
- **UI:** country filter + EU browse against mock clinics  

## File layout (planned)

```
src/crawler/
  types.ts
  sources.json          # allowlist
  adapters/             # directory, association, clinic_site
  normalize.ts
  dedupe.ts
  run-crawl.ts
scripts/crawl-clinics.ts
src/pages/api/clinics.ts
public/data/clinics.json
public/data/clinics-meta.json
```

Exact paths may shift slightly during planning to match Astro conventions.

## Success criteria

- Build produces updated clinic JSON from allowlisted sources  
- Deployed app serves clinics via `/api/clinics` with daily refresh cap  
- Results UI shows country clinics + EU browse with stand date  
- Failures degrade to last known good data, never blank clinic sections when build data exists  

## Out of scope for first implementation plan (follow-ups)

- Map view  
- User reviews / ratings aggregation  
- Automatic discovery of new directory domains outside allowlist  
- Paid third-party Places APIs as primary source  
