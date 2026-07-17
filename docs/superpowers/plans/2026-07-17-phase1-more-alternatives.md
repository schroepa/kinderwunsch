# Phase 1: Mehr Alternativen (Ergebnisse) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show more country and clinic alternatives in results — Top 3 + „Weitere Alternativen“, expanded country scoring (incl. AT/DK/NL/PT/IT/FR), clinic filter/sort with Top 3 + „Weitere Kliniken“, and `/kliniken?country=` deep-link.

**Architecture:** Keep recommendation scoring in `countryLogic.ts` but return **all non-forbidden** results (UI splits Top 3 / rest). Extract pure clinic ranking into `src/lib/clinicRanking.ts` for TDD. Align ISO↔slug maps with seed country ids (`austria`, `denmark`, …). Directory page reads `?country=` as ISO code.

**Tech Stack:** Astro 4 + React 18, existing Types, Vitest, Tailwind/shadcn patterns already in the app

**Spec:** `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` (Phase 1 only)

## Global Constraints

- German UI strings
- `forbidden` countries never shown; `restricted` shown with existing warning surface
- Conservative legal defaults for new countries (prefer `restricted` over inventing liberal rules); comment `// conservative default — verify`
- Do not invent clinic costs/ratings; missing costs sort last
- Disclaimer remains: „Angaben ohne Gewähr; bitte bei der Klinik bestätigen.“
- No CMS, no crawler source changes, no Phase 2/3 work
- Seed country slugs are English names: `portugal`, `netherlands`, `denmark`, `austria`, `italy`, `france` (not ISO lowercase)
- Tests: `npm test` (Vitest); include pattern `tests/**/*.test.ts`

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/crawler/countryMap.ts` | Canonical ISO ↔ app country slug (extend for AT/DK/NL/PT/IT/FR) |
| `src/lib/countryCodes.ts` | Thin re-export / display helper using the same map |
| `src/lib/clinicRanking.ts` | Pure `filterAndSortClinics(clinics, countryId, treatments)` |
| `src/lib/countryLogic.ts` | Add 6 countries; legal/cost/pros/score; drop `slice(0, 4)` |
| `src/components/ResultsDashboard.tsx` | Top 3 / Weitere Alternativen; clinic Top 3 / Weitere; deep-link |
| `src/components/ClinicsDirectoryPage.tsx` | Init filter from `?country=ISO`; names for new codes |
| `tests/lib/clinicRanking.test.ts` | Filter, fallback, sort order |
| `tests/lib/countryLogic.test.ts` | New countries scored; no hard cap; forbidden hidden |

Phases 2–3 are **out of this plan** (separate plans later).

---

### Task 1: Country ISO ↔ slug map for new countries

**Files:**
- Modify: `src/crawler/countryMap.ts`
- Modify: `src/lib/countryCodes.ts`
- Create: `tests/lib/countryMap.test.ts`

**Interfaces:**
- Consumes: existing `toCountrySlug` / `toCountryCode`
- Produces: maps covering `AT→austria`, `DK→denmark`, `NL→netherlands`, `PT→portugal`, `IT→italy`, `FR→france` (and reverse)

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/countryMap.test.ts
import { describe, expect, it } from 'vitest';
import { toCountrySlug, toCountryCode } from '../../src/crawler/countryMap';

describe('countryMap extended EU', () => {
  it('maps ISO codes used in seed clinics', () => {
    expect(toCountrySlug('AT')).toBe('austria');
    expect(toCountrySlug('DK')).toBe('denmark');
    expect(toCountrySlug('NL')).toBe('netherlands');
    expect(toCountrySlug('PT')).toBe('portugal');
    expect(toCountrySlug('IT')).toBe('italy');
    expect(toCountrySlug('FR')).toBe('france');
  });

  it('maps slugs back to ISO', () => {
    expect(toCountryCode('austria')).toBe('AT');
    expect(toCountryCode('denmark')).toBe('DK');
    expect(toCountryCode('netherlands')).toBe('NL');
    expect(toCountryCode('portugal')).toBe('PT');
    expect(toCountryCode('italy')).toBe('IT');
    expect(toCountryCode('france')).toBe('FR');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/countryMap.test.ts`
Expected: FAIL (slug falls back to lowercase ISO like `at`, not `austria`)

- [ ] **Step 3: Extend maps**

Update `ISO_TO_SLUG` in `src/crawler/countryMap.ts`:

```ts
const ISO_TO_SLUG: Record<string, string> = {
  DE: 'germany',
  CZ: 'czech',
  PL: 'poland',
  ES: 'spain',
  GR: 'greece',
  AT: 'austria',
  DK: 'denmark',
  NL: 'netherlands',
  PT: 'portugal',
  IT: 'italy',
  FR: 'france',
};
```

Replace `src/lib/countryCodes.ts` so display uses the same source of truth:

```ts
import { toCountryCode } from '../crawler/countryMap';

/** ISO alpha-2 for a recommendation country id (slug). */
export function countryIso(countryId: string): string {
  return toCountryCode(countryId);
}
```

Remove the duplicated `COUNTRY_ISO` object (or keep as deprecated re-export only if something imports it — grep and update callers to `countryIso`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/countryMap.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/crawler/countryMap.ts src/lib/countryCodes.ts tests/lib/countryMap.test.ts
git commit -m "feat: map AT/DK/NL/PT/IT/FR ISO codes to seed country slugs"
```

---

### Task 2: Pure clinic filter + sort

**Files:**
- Create: `src/lib/clinicRanking.ts`
- Create: `tests/lib/clinicRanking.test.ts`

**Interfaces:**
- Consumes: `Clinic`, `TreatmentType` from `src/lib/types.ts`
- Produces:
  - `export type ClinicRankResult = { clinics: Clinic[]; usedTreatmentFallback: boolean }`
  - `export function filterAndSortClinics(clinics: Clinic[], countryId: string, treatments: TreatmentType[]): ClinicRankResult`

**Sort contract (stable):**
1. Specialty overlap count with `treatments` (desc)
2. Cost key: prefer `approximateCost.icsi` if `icsi` in treatments else `approximateCost.ivf`; missing → `Number.POSITIVE_INFINITY` (sort last)
3. Name ascending as final tie-breaker (deterministic; distance is country-level only in Phase 1)

**Filter contract:**
1. `clinic.country === countryId`
2. Keep clinics where `specialties` intersects `treatments` (at least one)
3. If intersection yields empty but country has clinics → return all country clinics and `usedTreatmentFallback: true`
4. If country has zero clinics → empty list, `usedTreatmentFallback: false`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/clinicRanking.test.ts
import { describe, expect, it } from 'vitest';
import { filterAndSortClinics } from '../../src/lib/clinicRanking';
import type { Clinic } from '../../src/lib/types';

function clinic(partial: Partial<Clinic> & Pick<Clinic, 'id' | 'name' | 'country' | 'specialties'>): Clinic {
  return {
    city: 'X',
    website: 'https://example.com',
    countryCode: 'XX',
    source: 'directory',
    sourceUrl: 'seed',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('filterAndSortClinics', () => {
  const set: Clinic[] = [
    clinic({
      id: 'a',
      name: 'Alpha',
      country: 'spain',
      specialties: ['ivf'],
      approximateCost: { ivf: 5000, icsi: 6000 },
    }),
    clinic({
      id: 'b',
      name: 'Beta',
      country: 'spain',
      specialties: ['ivf', 'egg-donation'],
      approximateCost: { ivf: 4000, icsi: 4500 },
    }),
    clinic({
      id: 'c',
      name: 'Gamma',
      country: 'spain',
      specialties: ['pgd'],
    }),
    clinic({
      id: 'd',
      name: 'Other',
      country: 'germany',
      specialties: ['ivf', 'egg-donation'],
    }),
  ];

  it('filters by country and treatment overlap, sorts by overlap then cost', () => {
    const { clinics, usedTreatmentFallback } = filterAndSortClinics(set, 'spain', [
      'egg-donation',
      'ivf',
    ]);
    expect(usedTreatmentFallback).toBe(false);
    expect(clinics.map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('falls back to all country clinics when no specialty match', () => {
    const { clinics, usedTreatmentFallback } = filterAndSortClinics(set, 'spain', [
      'sperm-donation',
    ]);
    expect(usedTreatmentFallback).toBe(true);
    expect(clinics.map((c) => c.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('puts clinics without cost after priced ones when overlap ties', () => {
    const { clinics } = filterAndSortClinics(
      [
        clinic({
          id: 'no-cost',
          name: 'NoCost',
          country: 'greece',
          specialties: ['ivf'],
        }),
        clinic({
          id: 'priced',
          name: 'Priced',
          country: 'greece',
          specialties: ['ivf'],
          approximateCost: { ivf: 3000, icsi: 3500 },
        }),
      ],
      'greece',
      ['ivf'],
    );
    expect(clinics.map((c) => c.id)).toEqual(['priced', 'no-cost']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/clinicRanking.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/lib/clinicRanking.ts`**

```ts
import type { Clinic, TreatmentType } from './types';

export type ClinicRankResult = {
  clinics: Clinic[];
  usedTreatmentFallback: boolean;
};

function overlapCount(clinic: Clinic, treatments: TreatmentType[]): number {
  const set = new Set(clinic.specialties);
  return treatments.reduce((n, t) => n + (set.has(t) ? 1 : 0), 0);
}

function costKey(clinic: Clinic, treatments: TreatmentType[]): number {
  const cost = clinic.approximateCost;
  if (!cost) return Number.POSITIVE_INFINITY;
  if (treatments.includes('icsi') && typeof cost.icsi === 'number') return cost.icsi;
  if (typeof cost.ivf === 'number') return cost.ivf;
  return Number.POSITIVE_INFINITY;
}

export function filterAndSortClinics(
  clinics: Clinic[],
  countryId: string,
  treatments: TreatmentType[],
): ClinicRankResult {
  const inCountry = clinics.filter((c) => c.country === countryId);
  if (inCountry.length === 0) {
    return { clinics: [], usedTreatmentFallback: false };
  }

  const matched = inCountry.filter((c) => overlapCount(c, treatments) > 0);
  const usedTreatmentFallback = matched.length === 0;
  const pool = usedTreatmentFallback ? inCountry : matched;

  const sorted = [...pool].sort((a, b) => {
    const o = overlapCount(b, treatments) - overlapCount(a, treatments);
    if (o !== 0) return o;
    const c = costKey(a, treatments) - costKey(b, treatments);
    if (c !== 0) return c;
    return a.name.localeCompare(b.name, 'de');
  });

  return { clinics: sorted, usedTreatmentFallback };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/clinicRanking.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/clinicRanking.ts tests/lib/clinicRanking.test.ts
git commit -m "feat: filter and sort clinics by treatment overlap and cost"
```

---

### Task 3: Expand country recommendations (no hard cap)

**Files:**
- Modify: `src/lib/countryLogic.ts`
- Create: `tests/lib/countryLogic.test.ts`

**Interfaces:**
- Consumes: `UserData`, `Country`, `CountryRecommendation`
- Produces: `getCountryRecommendations(userData): CountryRecommendation[]` — **all** non-forbidden, sorted by score desc (no `slice`)

**New `Country` entries** (add to `countries` array; distances approx. from Berlin; baseCost rough EUR heuristics):

| id | name | baseCost | distanceFromBerlin |
|----|------|----------|--------------------|
| austria | Österreich | 4200 | 520 |
| denmark | Dänemark | 4500 | 360 |
| netherlands | Niederlande | 4300 | 580 |
| portugal | Portugal | 3800 | 2300 |
| italy | Italien | 4200 | 1200 |
| france | Frankreich | 4400 | 880 |

Pros/cons: short German bullets (3–5 each); keep tone like existing countries.

**Legal (`checkLegalStatus`) — conservative defaults:**

| id | Rules |
|----|--------|
| austria | `egg-donation` → `forbidden`; `same-sex` or `single` → `restricted`; else `allowed` |
| denmark | `femaleAge > 50` → `restricted`; else `allowed` |
| netherlands | `femaleAge > 50` → `restricted`; else `allowed` |
| portugal | `femaleAge > 50` → `restricted`; else `allowed` |
| italy | `egg-donation` → `restricted`; `same-sex` or `single` → `restricted`; else `allowed` |
| france | `femaleAge > 45` → `restricted`; else `allowed` |

Add `// conservative default — verify` above each new case.

**Cost:** extend `calculateCostEstimate` egg-donation / icsi branches for new ids with modest add-ons (mirror CZ/ES ranges; do not invent precision). Travel uses existing distance thresholds.

**Score / dynamic tips:** light bonuses for nearby AT/DK/NL; budget tips like existing; no need for full parity with ES/GR narrative.

**Helper for tests (optional export):** keep `getCountryRecommendations` as sole public API; assert via returned ids/length.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/countryLogic.test.ts
import { describe, expect, it } from 'vitest';
import { getCountryRecommendations } from '../../src/lib/countryLogic';
import type { UserData } from '../../src/lib/types';

const base: UserData = {
  femaleAge: 32,
  maleAge: 35,
  relationshipStatus: 'married',
  location: 'Berlin',
  budget: 8000,
  treatments: ['ivf', 'icsi'],
};

describe('getCountryRecommendations Phase 1', () => {
  it('includes expanded EU countries for a typical couple', () => {
    const ids = getCountryRecommendations(base).map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining([
      'germany',
      'czech',
      'poland',
      'spain',
      'greece',
      'austria',
      'denmark',
      'netherlands',
      'portugal',
      'italy',
      'france',
    ]));
    expect(ids.length).toBeGreaterThanOrEqual(8);
  });

  it('does not hard-cap at 4 results', () => {
    expect(getCountryRecommendations(base).length).toBeGreaterThan(4);
  });

  it('hides germany when egg-donation requested', () => {
    const ids = getCountryRecommendations({
      ...base,
      treatments: ['egg-donation'],
    }).map((r) => r.id);
    expect(ids).not.toContain('germany');
    expect(ids).not.toContain('austria');
  });

  it('marks italy restricted for single seekers', () => {
    const italy = getCountryRecommendations({
      ...base,
      relationshipStatus: 'single',
      treatments: ['ivf'],
    }).find((r) => r.id === 'italy');
    expect(italy?.legalStatus).toBe('restricted');
  });

  it('sorts by score descending', () => {
    const scores = getCountryRecommendations(base).map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/countryLogic.test.ts`
Expected: FAIL (new ids missing and/or length ≤ 4)

- [ ] **Step 3: Implement country expansions + remove slice**

In `src/lib/countryLogic.ts`:

1. Append the six `Country` objects to `countries`.
2. Extend `checkLegalStatus`, `getDynamicProsAndCons`, `calculateCostEstimate`, and lightly `calculateScore`.
3. Change the end of `getCountryRecommendations` from:

```ts
return recommendations.slice(0, 4);
```

to:

```ts
return recommendations;
```

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/lib/countryLogic.test.ts`
Expected: PASS

Also run: `npm test`
Expected: all existing crawler tests still PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/countryLogic.ts tests/lib/countryLogic.test.ts
git commit -m "feat: score more EU countries and return all legal alternatives"
```

---

### Task 4: ResultsDashboard — Top 3 / Weitere + clinic ranking UI

**Files:**
- Modify: `src/components/ResultsDashboard.tsx`

**Interfaces:**
- Consumes: `getCountryRecommendations`, `filterAndSortClinics`, `countryIso`
- Produces: UI split; deep-link `href={`/kliniken?country=${countryIso(country.id)}`}`

**Behaviour:**

```ts
const TOP_N = 3;
const primary = recommendations.slice(0, TOP_N);
const more = recommendations.slice(TOP_N);
```

- State: `showMoreCountries` (boolean, default `false`); `showMoreClinicsByCountry: Record<string, boolean>` or single boolean keyed by selected country.
- Intro copy: replace „Die N besten Länder…“ with something like: „Top-Empfehlungen für Ihre Angaben — weitere Alternativen darunter.“
- Render `primary` as today (existing card markup).
- If `more.length > 0`, show a `Button variant="secondary"` toggling „Weitere Alternativen (N)“ / „Weniger anzeigen“, then render `more` with the same card component (rank numbers continue: index + 1 + TOP_N, or global index in full list).
- Replace `getFilteredClinics` with:

```ts
const { clinics: ranked, usedTreatmentFallback } = filterAndSortClinics(
  clinics,
  country.id,
  userData.treatments,
);
const visible = showAllClinics ? ranked : ranked.slice(0, 3);
```

- Show hint when `usedTreatmentFallback`: „Keine Klinik mit exakt passender Spezialisierung — alle Kliniken in diesem Land:“
- If `ranked.length > 3`, toggle „Weitere Kliniken (N)“ 
- Change „Alle EU-Kliniken…“ link inside the expanded country block (and keep global footer link) to include `?country=` ISO when a country is selected; footer link without param can stay global.

Reuse existing `Button`, `Card`, warning styles — no new design system.

- [ ] **Step 1: Wire imports and ranking helper**

Add:

```ts
import { filterAndSortClinics } from '../lib/clinicRanking';
import { countryIso } from '../lib/countryCodes';
```

Remove local `getFilteredClinics`.

- [ ] **Step 2: Split recommendations + country „Weitere“ UI**

Implement `primary` / `more` / `showMoreCountries` as above. Ensure restricted badge still works on both lists.

- [ ] **Step 3: Clinic Top 3 + Weitere + fallback hint + deep-link**

In the `isSelected` block, use ranking; add toggles and:

```tsx
<a href={`/kliniken?country=${countryIso(country.id)}`}>
  Kliniken in {country.name} im Verzeichnis
</a>
```

Keep global `/kliniken` button as well.

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`  
Check: married + IVF/ICSI → ≥5 countries possible; Top 3 visible; expand Weitere; open Spain clinics → sorted; toggle Weitere Kliniken; link opens directory with filter.

Run: `npm test && npm run build`  
Expected: PASS / build OK

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultsDashboard.tsx
git commit -m "feat: show top and further country/clinic alternatives in results"
```

---

### Task 5: Directory deep-link `?country=`

**Files:**
- Modify: `src/components/ClinicsDirectoryPage.tsx`

**Interfaces:**
- Consumes: `window` / `URLSearchParams` on mount (client component)
- Produces: initial `country` state = ISO from query if valid, else `'all'`

- [ ] **Step 1: Extend `COUNTRY_NAMES`**

```ts
const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Deutschland',
  CZ: 'Tschechien',
  PL: 'Polen',
  ES: 'Spanien',
  GR: 'Griechenland',
  AT: 'Österreich',
  DK: 'Dänemark',
  NL: 'Niederlande',
  PT: 'Portugal',
  IT: 'Italien',
  FR: 'Frankreich',
};
```

- [ ] **Step 2: Read query on mount**

Before/alongside clinics load:

```ts
useEffect(() => {
  const param = new URLSearchParams(window.location.search).get('country');
  if (param && /^[A-Za-z]{2}$/.test(param)) {
    setCountry(param.toUpperCase());
  }
}, []);
```

Keep this separate from the fetch effect (or merge carefully so param wins even before clinics arrive).

- [ ] **Step 3: Smoke**

Open `/kliniken?country=ES` → select shows Spanien / ES and list filtered.  
Open `/kliniken` → all.

- [ ] **Step 4: Commit**

```bash
git add src/components/ClinicsDirectoryPage.tsx
git commit -m "feat: preselect clinic directory country from query param"
```

---

### Task 6: Phase 1 verification + docs pointer

**Files:**
- Modify: `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` (optional: mark Phase 1 AC checkboxes that are met — only if you verify)
- No code unless gaps found

- [ ] **Step 1: Full verification**

```bash
npm test
npm run build
```

Expected: all green.

Manual AC checklist from spec:

- [ ] AT/DK/NL/PT/IT/FR in scoring
- [ ] Top 3 + Weitere Alternativen
- [ ] Forbidden hidden / restricted badged
- [ ] Clinic treatment filter + fallback
- [ ] Clinic sort + Top 3 / Weitere
- [ ] `/kliniken?country=` works

- [ ] **Step 2: Commit only if doc checkboxes updated**

```bash
git add docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md
git commit -m "docs: check off Phase 1 acceptance criteria after implementation"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Expand scoring AT/DK/NL/PT/IT/FR | Task 3 (+ Task 1 maps) |
| Top 3 + Weitere Alternativen | Task 4 |
| Remove hard slice(0,4) | Task 3 |
| Forbidden hidden / restricted shown | Task 3–4 (existing UI + new cases) |
| Clinic filter by treatments + fallback | Task 2–4 |
| Sort Passung → Kosten (distance country-level) | Task 2 |
| Top 3 Kliniken + Weitere | Task 4 |
| `/kliniken?country=` | Task 4–5 |
| Unit tests scoring + sort/filter | Tasks 1–3 |
| No CMS / crawler / Phase 2–3 | Global constraints |

**Placeholder scan:** none intentional.  
**Type consistency:** `filterAndSortClinics` → `ClinicRankResult`; country ids match seed slugs; query uses ISO via `countryIso` / `toCountryCode`.
