# Phase 2: Wissen & SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a crawlable `/wissen` library (Astro Content Collections + MDX) with treatment/country/FAQ guides, contextual links from the tool, corrected production site URL, and sitemap — so users can learn about fertility options inside the app.

**Architecture:** Prerendered Astro pages read a `wissen` content collection. Shared `SiteLayout.astro` (or head partial) keeps theme/meta consistent with `/` and `/kliniken`. Guides use frontmatter that can later map 1:1 to a headless CMS. No external CMS in this phase. **Map/mapcn is explicitly out of scope** (scheduled after Phase 2).

**Tech Stack:** Astro 4 hybrid, `@astrojs/mdx`, Content Collections (zod schema), existing Tailwind/Geist UI, Vitest for schema/slug tests

**Spec:** `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` (Phase 2)

## Global Constraints

- German UI and article copy
- Medical disclaimer on every Wissens page (same spirit as app footer: no individual advice)
- Production site URL: `https://roser.vercel.app` (replace placeholder `schroepa-kinderwunsch.vercel.app`)
- Minimum **8** MDX guides live under `/wissen/[slug]` plus `/wissen` index
- Content fields: `title`, `description`, `category`, `relatedTreatments`, `relatedCountries`, `updatedAt` (CMS-ready)
- Categories: `treatment` | `country` | `guide` | `faq`
- No Sanity/Contentful; no mapcn / MapLibre / geo; no Phase 3 crawler work
- Prerender Wissen pages (`export const prerender = true`)
- Tests: `npm test`; build must pass `npm run build`

### Deferred (do not implement)

- Map view / mapcn Markers or Routes (user decision: after Phase 2)
- Headless CMS
- Country deep-dives beyond the five core lands in the initial set (AT/DK/… later)

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `astro.config.mjs` | `site: 'https://roser.vercel.app'`, add `mdx()` integration |
| `src/content/config.ts` | `wissen` collection zod schema |
| `src/content/wissen/*.mdx` | Guide bodies + frontmatter |
| `src/layouts/SiteLayout.astro` | Shared HTML shell: theme script, skip-link, meta slots, nav |
| `src/pages/wissen/index.astro` | Library overview by category |
| `src/pages/wissen/[slug].astro` | Article page + JSON-LD |
| `src/lib/wissen.ts` | Helpers: `getWissenBySlug`, category labels, treatment→slug map |
| `src/lib/treatments.ts` | Optional `guideSlug` per treatment for links |
| `src/components/FertilityApp.tsx` | Nav/footer link to `/wissen` |
| `src/components/UserInputForm.tsx` / `TreatmentToggle.tsx` | Link „Mehr erfahren“ → guide |
| `src/components/ResultsDashboard.tsx` | Land → `/wissen/land-{slug}`; Budget → `/wissen/kosten` |
| `public/sitemap.xml` / `public/robots.txt` | All Wissen URLs + correct host |
| `tests/lib/wissen.test.ts` | Schema/slug coverage (≥8, required categories) |

---

### Task 1: MDX + site URL + content schema

**Files:**
- Modify: `package.json` (add `@astrojs/mdx`)
- Modify: `astro.config.mjs`
- Create: `src/content/config.ts`
- Create: `src/lib/wissen.ts`
- Create: `tests/lib/wissen.test.ts`
- Modify: `public/robots.txt` (host only if present)

**Interfaces:**
- Consumes: Astro content collections API
- Produces:
  - Collection `wissen` with schema below
  - `export const SITE_ORIGIN = 'https://roser.vercel.app'`
  - `export type WissenCategory = 'treatment' | 'country' | 'guide' | 'faq'`
  - `export function treatmentGuideSlug(t: TreatmentType): string | undefined`

- [ ] **Step 1: Install MDX**

```bash
cd /Users/ptrck/Developer/kinderwunsch
npm install @astrojs/mdx
```

- [ ] **Step 2: Update `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://roser.vercel.app',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    mdx(),
  ],
});
```

- [ ] **Step 3: Write failing test for collection helpers**

```ts
// tests/lib/wissen.test.ts
import { describe, expect, it } from 'vitest';
import { TREATMENT_GUIDE_SLUG, WissenCategory } from '../../src/lib/wissen';

describe('wissen helpers', () => {
  it('maps treatments to guide slugs', () => {
    expect(TREATMENT_GUIDE_SLUG.ivf).toBe('ivf');
    expect(TREATMENT_GUIDE_SLUG.icsi).toBe('icsi');
    expect(TREATMENT_GUIDE_SLUG['egg-donation']).toBe('eizellspende');
    expect(TREATMENT_GUIDE_SLUG['sperm-donation']).toBe('samenspende');
    expect(TREATMENT_GUIDE_SLUG.pgd).toBe('pid');
  });

  it('exposes the four categories', () => {
    const cats: WissenCategory[] = ['treatment', 'country', 'guide', 'faq'];
    expect(cats).toHaveLength(4);
  });
});
```

(Note: full collection getCollection tests need Astro runtime — keep unit tests on pure helpers; content presence verified in Task 6 via build + file count.)

- [ ] **Step 4: Implement `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const wissen = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(40),
    category: z.enum(['treatment', 'country', 'guide', 'faq']),
    relatedTreatments: z
      .array(z.enum(['ivf', 'icsi', 'egg-donation', 'sperm-donation', 'pgd']))
      .default([]),
    relatedCountries: z.array(z.string()).default([]),
    updatedAt: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { wissen };
```

- [ ] **Step 5: Implement `src/lib/wissen.ts`**

```ts
import type { TreatmentType } from './types';

export const SITE_ORIGIN = 'https://roser.vercel.app';

export type WissenCategory = 'treatment' | 'country' | 'guide' | 'faq';

export const CATEGORY_LABELS: Record<WissenCategory, string> = {
  treatment: 'Behandlungen',
  country: 'Länder',
  guide: 'Praxis',
  faq: 'FAQ',
};

export const TREATMENT_GUIDE_SLUG: Record<TreatmentType, string> = {
  ivf: 'ivf',
  icsi: 'icsi',
  'egg-donation': 'eizellspende',
  'sperm-donation': 'samenspende',
  pgd: 'pid',
};

export const COUNTRY_GUIDE_SLUG: Record<string, string> = {
  germany: 'land-deutschland',
  czech: 'land-tschechien',
  poland: 'land-polen',
  spain: 'land-spanien',
  greece: 'land-griechenland',
};

export function treatmentGuidePath(t: TreatmentType): string {
  return `/wissen/${TREATMENT_GUIDE_SLUG[t]}`;
}

export function countryGuidePath(countryId: string): string | null {
  const slug = COUNTRY_GUIDE_SLUG[countryId];
  return slug ? `/wissen/${slug}` : null;
}
```

- [ ] **Step 6: Run tests**

```bash
npm test -- tests/lib/wissen.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/content/config.ts src/lib/wissen.ts tests/lib/wissen.test.ts
git commit -m "feat: add MDX content collection scaffold and production site URL"
```

---

### Task 2: SiteLayout + Wissen index/article routes

**Files:**
- Create: `src/layouts/SiteLayout.astro`
- Create: `src/pages/wissen/index.astro`
- Create: `src/pages/wissen/[slug].astro`
- Modify: `src/pages/index.astro` (optional: switch to layout — preferred for DRY)
- Modify: `src/pages/kliniken.astro` (same)

**Interfaces:**
- Consumes: `getCollection('wissen')`, `SITE_ORIGIN`
- Produces: prerendered `/wissen`, `/wissen/[slug]`

Layout props: `title`, `description`, `canonicalPath` (e.g. `/wissen/ivf`), optional `jsonLd` object.

Nav links: Finder `/`, Kliniken `/kliniken`, Wissen `/wissen`.

Disclaimer block (German):

> Dieser Artikel dient der allgemeinen Information und ersetzt keine individuelle medizinische oder rechtliche Beratung.

Article prose styles: reuse `measure`, `text-fluid-*`, `prose` optional — prefer existing tokens (`text-muted-foreground`, headings) without adding `@tailwindcss/typography` unless already present (it is **not** — do not add; style MDX with a small `.wissen-prose` class in `globals.css`).

- [ ] **Step 1: Add minimal `.wissen-prose` in `globals.css`**

```css
.wissen-prose h2 {
  @apply mt-10 mb-3 text-fluid-2xl font-semibold tracking-tight text-foreground;
}
.wissen-prose h3 {
  @apply mt-8 mb-2 text-fluid-xl font-semibold text-foreground;
}
.wissen-prose p {
  @apply mb-4 text-fluid-base leading-relaxed text-foreground/85;
}
.wissen-prose ul {
  @apply mb-4 list-disc space-y-2 pl-5 text-fluid-base text-foreground/85;
}
.wissen-prose a {
  @apply font-medium text-primary underline-offset-2 hover:underline;
}
```

- [ ] **Step 2: Create `SiteLayout.astro`**

Include: charset, viewport, description, canonical `${SITE_ORIGIN}${canonicalPath}`, OG tags, theme inline script (copy from `index.astro`), skip-link, header nav, `<slot />`, footer with disclaimer slot optional.

Export `prerender` stays on pages, not layout.

- [ ] **Step 3: `wissen/index.astro`**

```astro
---
export const prerender = true;
import { getCollection } from 'astro:content';
import SiteLayout from '../../layouts/SiteLayout.astro';
import { CATEGORY_LABELS, type WissenCategory } from '../../lib/wissen';

const entries = (await getCollection('wissen'))
  .filter((e) => !e.data.draft)
  .sort((a, b) => a.data.title.localeCompare(b.data.title, 'de'));

const byCategory = (cat: WissenCategory) => entries.filter((e) => e.data.category === cat);
---
<SiteLayout
  title="Wissen | Kinderwunsch-Finder"
  description="Guides zu IVF, ICSI, Spenderbehandlungen, Kosten und rechtlichen Rahmenbedingungen in Europa."
  canonicalPath="/wissen"
>
  <!-- hero + sections per CATEGORY_LABELS listing links to /wissen/{slug} -->
</SiteLayout>
```

Implement listing UI matching app atmosphere (`app-atmosphere`, brand label).

- [ ] **Step 4: `wissen/[slug].astro`**

```astro
---
export const prerender = true;
import { getCollection } from 'astro:content';
import SiteLayout from '../../layouts/SiteLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('wissen');
  return entries
    .filter((e) => !e.data.draft)
    .map((entry) => ({
      params: { slug: entry.slug },
      props: { entry },
    }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const canonicalPath = `/wissen/${entry.slug}`;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': entry.data.category === 'faq' ? 'FAQPage' : 'MedicalWebPage',
  name: entry.data.title,
  description: entry.data.description,
  dateModified: entry.data.updatedAt.toISOString(),
  inLanguage: 'de',
};
---
<SiteLayout
  title={`${entry.data.title} | Kinderwunsch-Finder`}
  description={entry.data.description}
  canonicalPath={canonicalPath}
  jsonLd={jsonLd}
>
  <article class="wissen-prose measure mx-auto max-w-3xl px-4 py-10 sm:py-14">
    <p class="label-geist text-primary mb-3">Wissen</p>
    <h1 class="text-fluid-3xl font-semibold tracking-tight">{entry.data.title}</h1>
    <p class="mt-4 text-fluid-lg text-muted-foreground">{entry.data.description}</p>
    <Content />
    <aside class="mt-12 rounded-xl border border-border/60 bg-secondary/40 p-4 text-fluid-sm text-muted-foreground">
      Dieser Artikel dient der allgemeinen Information und ersetzt keine individuelle medizinische oder rechtliche Beratung.
    </aside>
    <p class="mt-8"><a href="/wissen">Alle Wissensartikel</a> · <a href="/">Zum Finder</a></p>
  </article>
</SiteLayout>
```

- [ ] **Step 5: Refactor `index.astro` / `kliniken.astro` onto SiteLayout** (keep React islands as slots/children). Preserve existing titles/JSON-LD for home.

- [ ] **Step 6: Smoke build** (will fail until MDX files exist — add one placeholder MDX in this task OR wait for Task 3). Prefer creating a single `src/content/wissen/_placeholder.mdx` only if needed; better: land Task 3 same session. If building now, create minimal `faq.mdx` stub so `getCollection` is non-empty.

Minimal stub for green build:

```mdx
---
title: Häufige Fragen
description: Kurze Antworten zu Kinderwunschbehandlung, Kosten und Auslandsoptionen in Europa — allgemein und ohne individuelle Beratung.
category: faq
relatedTreatments: []
relatedCountries: []
updatedAt: 2026-07-17
---

## Werden die Empfehlungen individuell geprüft?

Nein. Der Finder und diese Texte geben Orientierung anhand allgemeiner Regeln.
```

- [ ] **Step 7: Commit**

```bash
git add src/layouts/SiteLayout.astro src/pages/wissen src/pages/index.astro src/pages/kliniken.astro src/styles/globals.css src/content/wissen
git commit -m "feat: add Wissen routes and shared site layout"
```

---

### Task 3: Author minimum content library (≥8 MDX)

**Files:**
- Create under `src/content/wissen/`:

| File (slug) | category | relatedTreatments | relatedCountries |
|-------------|----------|-------------------|------------------|
| `ivf.mdx` | treatment | `[ivf]` | `[]` |
| `icsi.mdx` | treatment | `[icsi]` | `[]` |
| `eizellspende.mdx` | treatment | `[egg-donation]` | `[]` |
| `samenspende.mdx` | treatment | `[sperm-donation]` | `[]` |
| `pid.mdx` | treatment | `[pgd]` | `[]` |
| `kosten.mdx` | guide | `[]` | `[]` |
| `recht-europa.mdx` | guide | `[]` | `[]` |
| `faq.mdx` | faq | `[]` | `[]` |
| `land-deutschland.mdx` | country | `[]` | `[germany]` |
| `land-tschechien.mdx` | country | `[]` | `[czech]` |
| `land-polen.mdx` | country | `[]` | `[poland]` |
| `land-spanien.mdx` | country | `[]` | `[spain]` |
| `land-griechenland.mdx` | country | `[]` | `[greece]` |

(13 pages > 8 minimum — ship all listed.)

**Content rules:**
- Accurate-enough general orientation; no invented success rates as guarantees
- Cross-link with markdown links e.g. `[IVF](/wissen/ivf)`, `[Finder](/)`, `[Kliniken](/kliniken)`
- Each treatment article: What / When / Limits / Link to recht + kosten
- Each country article: Legal snapshot (aligned with `countryLogic` tone: conservative), typical cost band, travel note, link to `/kliniken?country=XX`
- `faq.mdx`: ≥5 Q&A as `h2` questions + short answers (supports FAQPage JSON-LD later enrichment if desired)
- `updatedAt: 2026-07-17` for all initial files
- Remove Task-2 stub if replaced by full `faq.mdx`

- [ ] **Step 1: Write all MDX files** (German, ~300–600 words each; shorter FAQ items OK)

Example frontmatter + structure for `ivf.mdx`:

```mdx
---
title: IVF — In-vitro-Fertilisation
description: Was IVF bedeutet, für wen sie infrage kommt und worauf Paare bei Kosten und rechtlichen Rahmenbedingungen in Europa achten sollten.
category: treatment
relatedTreatments: [ivf]
relatedCountries: []
updatedAt: 2026-07-17
---

## Was ist IVF?

…

## Für wen kommt IVF infrage?

…

## Kosten und Organisation

Mehr dazu im Überblick [Was kostet eine Kinderwunschbehandlung?](/wissen/kosten).

## Rechtliche Hinweise

Länderspezifische Regeln unterscheiden sich — siehe [Rechtliche Unterschiede in Europa](/wissen/recht-europa) und den [Finder](/).
```

Repeat for all rows in the table. Country pages must use ISO in klinik links: DE, CZ, PL, ES, GR.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: all `/wissen/*` prerendered; no schema errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/wissen
git commit -m "content: add initial Wissen library for treatments, countries, FAQ"
```

---

### Task 4: Contextual links from the tool

**Files:**
- Modify: `src/lib/treatments.ts` (add `guidePath` using `treatmentGuidePath` or duplicate slug constant — prefer import from `wissen.ts`)
- Modify: `src/components/TreatmentToggle.tsx` or `UserInputForm.tsx` — under each treatment description, link `Mehr erfahren` → guide
- Modify: `src/components/ResultsDashboard.tsx` — for each country card, if `countryGuidePath(country.id)`, show text link „Länder-Guide“; near budget warning, link to `/wissen/kosten`
- Modify: `src/components/FertilityApp.tsx` — footer/nav: `Wissen` → `/wissen`
- Modify: `src/components/ClinicsDirectoryPage.tsx` — header/nav link to `/wissen`

Minimum **3** distinct context-link surfaces (spec AC).

- [ ] **Step 1: Wire treatment „Mehr erfahren“**

In the treatment option UI, after description:

```tsx
<a
  href={treatmentGuidePath(treatment)}
  className="text-fluid-xs font-medium text-primary hover:underline"
>
  Mehr erfahren
</a>
```

- [ ] **Step 2: Wire results country + budget links**

```tsx
{countryGuidePath(country.id) && (
  <a href={countryGuidePath(country.id)!} className="…">
    Mehr zu {country.name}
  </a>
)}
```

Budget alert description: append link to `/wissen/kosten`.

- [ ] **Step 3: Global nav**

Ensure Wissen appears on home, kliniken, and wissen layout nav.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/lib/treatments.ts src/components/TreatmentToggle.tsx src/components/UserInputForm.tsx src/components/ResultsDashboard.tsx src/components/FertilityApp.tsx src/components/ClinicsDirectoryPage.tsx
git commit -m "feat: link Finder and results into Wissen guides"
```

---

### Task 5: Sitemap + robots + verify AC on domain

**Files:**
- Modify: `public/sitemap.xml` — every Wissen URL + `/` + `/kliniken` on `https://roser.vercel.app`
- Modify: `public/robots.txt` — Sitemap line to same host
- Modify: `docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md` — check Phase 2 AC boxes when verified
- Optionally append short „Map deferred“ note under Phase 2 out-of-scope / Open questions

- [ ] **Step 1: Rewrite sitemap**

Include at least:

- `/`
- `/kliniken`
- `/wissen`
- `/wissen/ivf`, `icsi`, `eizellspende`, `samenspende`, `pid`
- `/wissen/kosten`, `recht-europa`, `faq`
- `/wissen/land-deutschland`, `land-tschechien`, `land-polen`, `land-spanien`, `land-griechenland`

All `https://roser.vercel.app/...`

- [ ] **Step 2: robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://roser.vercel.app/sitemap.xml
```

- [ ] **Step 3: Verify AC**

```bash
npm test
npm run build
ls src/content/wissen/*.mdx | wc -l   # expect ≥ 8
rg -n "roser.vercel.app" astro.config.mjs public/sitemap.xml public/robots.txt
```

- [ ] **Step 4: Commit**

```bash
git add public/sitemap.xml public/robots.txt docs/superpowers/specs/2026-07-17-more-alternatives-content-clinics-design.md
git commit -m "docs: ship Wissen sitemap and mark Phase 2 acceptance criteria"
```

---

### Task 6: Phase 2 verification

**Files:** none required unless gaps

- [ ] **Step 1: Full verification checklist**

- [ ] `/wissen` lists all categories
- [ ] ≥8 MDX pages reachable
- [ ] Meta/canonical use `roser.vercel.app`
- [ ] ≥3 context links from tool → Wissen
- [ ] Disclaimer on article pages
- [ ] Sitemap includes Wissen URLs
- [ ] `npm test` + `npm run build` green
- [ ] No mapcn / geo code introduced

- [ ] **Step 2: Manual smoke** (`npm run dev`): home → treatment Mehr erfahren; results → Länder-Guide; footer → Wissen

- [ ] **Step 3: Commit only if doc/AC updates remain**

---

## After Phase 2 (not this plan)

**Map spike (user decision A):** add optional `lat`/`lng` on clinics (geocode city), mapcn `Map` + `MapMarker` on `/kliniken`; **Routes**/OSRM later for Anreise. Separate plan.

---

## Spec coverage (self-review)

| Spec AC / requirement | Task |
|----------------------|------|
| `/wissen` + ≥8 MDX | Tasks 2–3 |
| Sitemap + Meta/OG | Tasks 2, 5 |
| ≥3 Context-Links | Task 4 |
| Medical disclaimer | Task 2–3 |
| Canonical/site → real domain | Tasks 1, 5 |
| No CMS / no map | Global constraints |
| CMS-ready frontmatter | Task 1 schema |

**Placeholder scan:** content bodies authored in Task 3 (not TBD). Map explicitly deferred.
