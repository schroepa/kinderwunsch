# Map Spike: Klinik-Karte (mapcn Marker) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a MapLibre/mapcn marker map on `/kliniken` so users can see clinic locations for the current filter, with list↔map toggle — without routing/OSRM yet.

**Architecture:** Extend `Clinic` with optional `lat`/`lng`. Seed clinics get coordinates from a curated city geocode table (static, offline-friendly). Client map uses mapcn (`Map`, `MapMarker`, popup/tooltip) on `/kliniken` only. Clinics without coordinates stay list-only and show a count of „ohne Kartenposition“.

**Tech Stack:** mapcn (`@mapcn/map` via shadcn), MapLibre GL, existing React ClinicsDirectoryPage, Vitest

**Decisions (2026-07-17):** After Phase 2; **Markers first**; **MapRoute/OSRM deferred**.

## Global Constraints

- German UI strings
- Disclaimer unchanged: „Angaben ohne Gewähr; bitte bei der Klinik bestätigen.“
- Coordinates are **approximate city-level** (not street address) — label UI accordingly („ungefähre Lage“)
- No live geocoding API in production request path (no Nominatim/OSRM at runtime in this spike)
- No `MapRoute` / driving directions in this spike
- Do not block clinics without coords from the list
- Dark/light: use mapcn default CARTO theme switching if available; otherwise accept default tiles
- Tests: `npm test`; build: `npm run build`
- Keep Astro hybrid + existing SiteLayout

### Out of scope

- Turn-by-turn / `MapRoute` / OSRM
- Clustering / GeoJSON layers (≤ ~50 markers is fine with DOM markers per mapcn docs)
- ResultsDashboard embedded mini-map
- Phase 3 crawler directory mass-import
- Precise address geocoding / user GPS

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/lib/types.ts` | Optional `lat?: number; lng?: number` on `Clinic` |
| `src/lib/cityCoordinates.ts` | Static `city+countryCode → {lat,lng}` table + `lookupCityCoords` |
| `src/lib/attachClinicCoords.ts` | Pure: merge coords onto clinics (seed/API payload) |
| `scripts/enrich-clinic-coords.ts` (optional) | One-shot: write lat/lng into `public/data/clinics.seed.json` / `clinics.json` |
| `src/components/ui/map.tsx` | mapcn component (installed, may need path alias tweaks for Astro) |
| `src/components/ClinicsMap.tsx` | Client map: markers for filtered clinics with coords |
| `src/components/ClinicsDirectoryPage.tsx` | List/Karte toggle; pass filtered clinics to map |
| `src/crawler/normalize.ts` / adapters | Pass through lat/lng if present on raw/seed |
| `tests/lib/cityCoordinates.test.ts` | Lookup + attach helpers |
| `tests/lib/attachClinicCoords.test.ts` | Missing city → no coords; present → attached |

---

### Task 1: Clinic coords model + static geocode table

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/cityCoordinates.ts`
- Create: `src/lib/attachClinicCoords.ts`
- Create: `tests/lib/cityCoordinates.test.ts`
- Create: `tests/lib/attachClinicCoords.test.ts`

**Interfaces:**
```ts
// types.ts — on Clinic
lat?: number;
lng?: number;

// cityCoordinates.ts
export type Coords = { lat: number; lng: number };
export function lookupCityCoords(city: string, countryCode: string): Coords | undefined;

// attachClinicCoords.ts
export function attachClinicCoords(clinics: Clinic[]): Clinic[];
```

**City table (minimum — cover all seed cities):**

| city (normalize) | countryCode | approx lat | lng |
|------------------||-------------|------------|-----|
| Berlin | DE | 52.52 | 13.405 |
| Hamburg | DE | 53.551 | 9.994 |
| Prag / Prague | CZ | 50.075 | 14.438 |
| Brünn / Brno | CZ | 49.195 | 16.607 |
| (all other cities in `clinics.seed.json`) | … | … | … |

Normalize keys: `trim`, lowercase, strip diacritics for lookup aliases (e.g. `prag`/`prague`, `brünn`/`brno`, `mailand`/`milano`, `wien`/`vienna`, `kopenhagen`/`copenhagen`, `lissabon`/`lisbon`, `paris`, `rotterdam`).

- [ ] **Step 1: Write failing tests**

```ts
// tests/lib/cityCoordinates.test.ts
import { describe, expect, it } from 'vitest';
import { lookupCityCoords } from '../../src/lib/cityCoordinates';

describe('lookupCityCoords', () => {
  it('finds Berlin DE', () => {
    expect(lookupCityCoords('Berlin', 'DE')).toEqual({ lat: 52.52, lng: 13.405 });
  });

  it('matches aliases for Prague', () => {
    expect(lookupCityCoords('Prag', 'CZ')?.lat).toBeCloseTo(50.075, 2);
    expect(lookupCityCoords('Prague', 'CZ')?.lat).toBeCloseTo(50.075, 2);
  });

  it('returns undefined for unknown city', () => {
    expect(lookupCityCoords('Nowhereville', 'XX')).toBeUndefined();
  });
});
```

```ts
// tests/lib/attachClinicCoords.test.ts
import { describe, expect, it } from 'vitest';
import { attachClinicCoords } from '../../src/lib/attachClinicCoords';
import type { Clinic } from '../../src/lib/types';

function base(partial: Partial<Clinic> & Pick<Clinic, 'id' | 'name' | 'city' | 'countryCode'>): Clinic {
  return {
    country: 'germany',
    website: 'https://example.com',
    specialties: ['ivf'],
    source: 'directory',
    sourceUrl: 'seed',
    updatedAt: '2026-07-17T00:00:00.000Z',
    ...partial,
  };
}

describe('attachClinicCoords', () => {
  it('adds lat/lng when city is known', () => {
    const [c] = attachClinicCoords([base({ id: '1', name: 'A', city: 'Berlin', countryCode: 'DE' })]);
    expect(c.lat).toBeDefined();
    expect(c.lng).toBeDefined();
  });

  it('preserves existing lat/lng', () => {
    const [c] = attachClinicCoords([
      base({ id: '1', name: 'A', city: 'Berlin', countryCode: 'DE', lat: 1, lng: 2 }),
    ]);
    expect(c.lat).toBe(1);
    expect(c.lng).toBe(2);
  });

  it('leaves unknown cities without coords', () => {
    const [c] = attachClinicCoords([
      base({ id: '1', name: 'A', city: 'Unknown', countryCode: 'DE' }),
    ]);
    expect(c.lat).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- tests/lib/cityCoordinates.test.ts tests/lib/attachClinicCoords.test.ts
```

- [ ] **Step 3: Implement types + modules**

Read `public/data/clinics.seed.json`, list every unique `city`+`countryCode`, add each to `CITY_COORDS` with approximate Wikipedia/OSM city center values (document source comment at top of file: „city centroids, approximate“).

`attachClinicCoords`: if `clinic.lat != null && clinic.lng != null` return as-is; else lookup and spread.

- [ ] **Step 4: Tests PASS + commit**

```bash
npm test -- tests/lib/cityCoordinates.test.ts tests/lib/attachClinicCoords.test.ts
git add src/lib/types.ts src/lib/cityCoordinates.ts src/lib/attachClinicCoords.ts tests/lib/cityCoordinates.test.ts tests/lib/attachClinicCoords.test.ts
git commit -m "feat: add optional clinic coordinates via city lookup table"
```

---

### Task 2: Persist coords on seed/build JSON + load path

**Files:**
- Modify: `public/data/clinics.seed.json` (add lat/lng per row via attach)
- Modify: `public/data/clinics.json` (regenerate or attach same values)
- Modify: `src/crawler/adapters/seed.ts` / `normalize.ts` — pass through `lat`/`lng` if present on raw
- Modify: `src/lib/loadClinics.ts` — after fetch, `attachClinicCoords` as safety net for older caches

- [ ] **Step 1: Script or one-off to enrich seed**

```bash
npx tsx -e "
import fs from 'node:fs';
import { attachClinicCoords } from './src/lib/attachClinicCoords.ts';
const path = 'public/data/clinics.seed.json';
const clinics = attachClinicCoords(JSON.parse(fs.readFileSync(path,'utf8')));
fs.writeFileSync(path, JSON.stringify(clinics, null, 2) + '\n');
"
```

Repeat for `public/data/clinics.json` **or** run `npm run crawl:clinics` if crawl preserves seed fields — prefer writing both JSON files with coords for immediate UI.

- [ ] **Step 2: Ensure normalize preserves numbers**

If `RawClinic` / normalize drops unknown fields, add optional `lat`/`lng` to the crawler raw type and copy in `normalizeRawClinic`.

- [ ] **Step 3: loadClinics safety net**

```ts
import { attachClinicCoords } from './attachClinicCoords';
// after parsing API/static response:
return { ...data, clinics: attachClinicCoords(data.clinics) };
```

- [ ] **Step 4: Commit**

```bash
git add public/data/clinics.seed.json public/data/clinics.json src/lib/loadClinics.ts src/crawler/
git commit -m "feat: persist city-level coordinates on clinic seed data"
```

---

### Task 3: Install mapcn Map component

**Files:**
- Create: `src/components/ui/map.tsx` (and any CSS mapcn adds)
- Modify: `package.json` (maplibre-gl etc.)
- Possibly: `src/styles/globals.css` for maplibre CSS import

- [ ] **Step 1: Install**

From repo root (Astro + existing shadcn paths):

```bash
cd /Users/ptrck/Developer/kinderwunsch
npx shadcn@latest add @mapcn/map --yes
```

If the CLI fails (no components.json), fall back:

```bash
npm install maplibre-gl
```

Then manually add the mapcn `Map` component from [mapcn installation docs](https://www.mapcn.dev/docs/installation) into `src/components/ui/map.tsx`, adjusting imports to `@/` and existing `Button` if needed.

- [ ] **Step 2: Import MapLibre CSS**

In `globals.css` or the map module:

```css
@import 'maplibre-gl/dist/maplibre-gl.css';
```

(or `import 'maplibre-gl/dist/maplibre-gl.css'` in `ClinicsMap.tsx`)

- [ ] **Step 3: Smoke** — a tiny throwaway page is unnecessary; verify in Task 4. Ensure `npm run build` still typechecks after install.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/ui/map.tsx src/styles/globals.css components.json 2>/dev/null
git commit -m "chore: add mapcn MapLibre map UI component"
```

---

### Task 4: ClinicsMap + directory list/map toggle

**Files:**
- Create: `src/components/ClinicsMap.tsx`
- Modify: `src/components/ClinicsDirectoryPage.tsx`

**UI behaviour:**

1. Toggle control: **Liste** | **Karte** (default Liste on mobile; Karte allowed on all breakpoints with `min-h-[420px]`).
2. Map receives **currently filtered** clinics (same `q` + country filter).
3. Only clinics with both `lat` and `lng` get markers.
4. Caption: „Ungefähre Lage (Stadtzentrum). N Kliniken ohne Kartenposition.“
5. Marker popup: name, city, countryCode, link to website, optional specialties short list.
6. Map `center`/`zoom`: if 1 marker → that point zoom 10; if many → fit bounds (mapcn/MapLibre `fitBounds` if exposed; else center on Europe `[10, 50]` zoom 3.5 and let user pan).
7. Sync: clicking a marker may scroll/highlight list item if both views visible later — **YAGNI**: map-only mode is enough; optional `selectedId` state if easy.

**ClinicsMap sketch:**

```tsx
'use client';
import { Map, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from '@/components/ui/map';
import type { Clinic } from '@/lib/types';

export function ClinicsMap({ clinics }: { clinics: Clinic[] }) {
  const withCoords = clinics.filter((c) => c.lat != null && c.lng != null);
  const missing = clinics.length - withCoords.length;
  const center: [number, number] =
    withCoords.length === 1
      ? [withCoords[0].lng!, withCoords[0].lat!]
      : [10, 50];

  return (
    <div className="space-y-3">
      <p className="text-fluid-xs text-muted-foreground">
        Ungefähre Lage (Stadtzentrum)
        {missing > 0 ? ` · ${missing} ohne Kartenposition` : null}
      </p>
      <div className="h-[min(70vh,520px)] w-full overflow-hidden rounded-xl border border-border/60">
        <Map center={center} zoom={withCoords.length <= 1 ? 10 : 3.5}>
          {withCoords.map((c) => (
            <MapMarker key={c.id} longitude={c.lng!} latitude={c.lat!}>
              <MarkerContent>
                <div className="size-3.5 rounded-full border-2 border-background bg-primary shadow-soft" />
              </MarkerContent>
              <MarkerTooltip>{c.name}</MarkerTooltip>
              <MarkerPopup>
                <div className="space-y-1 p-1">
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-fluid-xs text-muted-foreground">
                    {c.city} · {c.countryCode}
                  </p>
                  <a href={c.website} className="text-fluid-xs font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
                    Website
                  </a>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </div>
  );
}
```

Wire into `ClinicsDirectoryPage` with `view: 'list' | 'map'` state and segmented buttons using existing `Button` variants.

- [ ] **Step 1: Implement ClinicsMap**
- [ ] **Step 2: Wire toggle in directory**
- [ ] **Step 3: Manual smoke** — `/kliniken`, filter ES, switch to Karte, open popup
- [ ] **Step 4: `npm test && npm run build`**
- [ ] **Step 5: Commit**

```bash
git add src/components/ClinicsMap.tsx src/components/ClinicsDirectoryPage.tsx
git commit -m "feat: add clinic map view with mapcn markers on /kliniken"
```

---

### Task 5: Verify + docs note

**Files:**
- Modify: `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` — note Map spike shipped (markers only); Routes still later
- Optional: README one-liner under Features

**AC checklist:**

- [ ] All seed clinics that have known cities get lat/lng (or documented missing)
- [ ] `/kliniken` Liste | Karte toggle works
- [ ] Markers respect country/search filter
- [ ] Clinics without coords still appear in list; counted on map caption
- [ ] No MapRoute / OSRM code
- [ ] `npm test` + `npm run build` green
- [ ] Mobile: map height usable, no horizontal overflow

- [ ] **Step 1: Run verification**
- [ ] **Step 2: Commit docs if updated**

```bash
git commit -m "docs: record clinic map spike (markers, routes deferred)"
```

---

## Follow-up (separate plan)

1. **fitBounds** polish when mapcn API supports it cleanly  
2. **MapRoute + OSRM** from user `location` city → selected clinic (Anreise)  
3. Phase 3 crawler: enrich lat/lng from directory pages when available  

---

## Spec coverage

| Requirement | Task |
|-------------|------|
| Optional lat/lng on Clinic | 1–2 |
| Offline city geocode | 1 |
| mapcn markers on /kliniken | 3–4 |
| Filter-aware map | 4 |
| No routes | Global constraints |
| Approximate location disclaimer | 4 |

**Placeholder scan:** city table must be fully populated for current seed cities in Task 1 (read seed file — no TBD cities).
