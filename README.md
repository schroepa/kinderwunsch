# Roser

Interaktive Web-App zur Suche nach geeigneten Kinderwunschbehandlungen und Kliniken in Europa. Nutzer geben Alter, Beziehungsstatus, Wohnort, Budget und gewünschte Behandlungen ein und erhalten priorisierte Länderempfehlungen sowie Klinikdaten.

**Marke:** Roser — Logo-Mark (Rosenknospe) + Wortmarke in Geist Sans.

## Funktionen

- Interaktives Eingabeformular (Alter, Status, Ort, Budget, Behandlungen)
- Dynamische Länderempfehlungen anhand rechtlicher und praktischer Regeln
- Hybrid-Klinikdaten: Build-Fallback plus Runtime-API mit optionalem Vercel-Blob-Cache
- Eigenes EU-Klinikverzeichnis unter `/kliniken` (Suche, Länderfilter, Karten-Grid)
- Dark Mode (Systempräferenz, manuell umschaltbar, ohne Flash beim Laden)
- Design-System angelehnt an Vercel Geist (neutrale Surfaces, Teal-Akzent, Geist Sans/Mono)
- Lucide-Icons statt Emojis; dezente Motion
- Agent Skills unter `.cursor/skills/` (UX, SEO/GEO, UI, Accessibility, Dev, Product Owner)

## Tech-Stack

| Bereich | Technologie |
|--------|-------------|
| Framework | Astro 4 (Hybrid Output) |
| UI | React 18, shadcn/ui-Patterns |
| Styling | Tailwind CSS, CSS-Variablen, Geist-Fonts |
| Icons / Motion | lucide-react, motion |
| Daten | JSON (Build), Vercel Blob (optional Runtime) |
| Crawler | Cheerio, Allowlist-Quellen |
| Tests | Vitest |
| Hosting | Vercel Serverless (`@astrojs/vercel`) |

## Voraussetzungen

- Node.js **20.x** (von Vercel für Serverless Functions verlangt; in `package.json` → `engines` gesetzt)
- npm oder pnpm

## Setup

```bash
npm install
npm run dev
```

App lokal: `http://localhost:4321` (alternativ nächster freier Port).

Optional für Blob-API lokal:

```bash
cp .env.example .env
# BLOB_READ_WRITE_TOKEN setzen
```

## Scripts

| Befehl | Beschreibung |
|--------|----------------|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Typecheck + Produktionsbuild |
| `npm run preview` | Build lokal previewen |
| `npm test` | Vitest (Crawler-Unit-Tests) |
| `npm run crawl:clinics` | Klinikdaten aus Allowlist crawlen |

`crawl:clinics` schreibt `public/data/clinics.json` und `public/data/clinics-meta.json` anhand von `src/crawler/sources.json`.

## Deployment (Vercel)

1. Framework Preset: Astro (Hybrid)
2. Umgebungsvariable: `BLOB_READ_WRITE_TOKEN` (Vercel Blob Store)
3. Optional vor dem Build: `npm run crawl:clinics`
4. Ohne Blob-Token nutzt `GET /api/clinics` den statischen Fallback unter `public/data/`

Die Klinik-API nutzt stale-while-revalidate und begrenzt Crawl-Zyklen (u. a. max. ein voller Refresh-Pfad pro Tag clientseitig).

## Design und Themes

- Richtung: nordisch-klinisch (kühler Mist, tiefes Teal, Grain-Atmosphäre)
- Marken-Hero mit Logo-Mark und Wortmarke „Roser“ (Geist Sans)
- Fonts: Geist Sans und Geist Mono unter `public/fonts/`
- Dark Mode: Systempräferenz, Toggle, flash-freies Inline-Script
- Utility-Klassen: `.label-geist`, `.data-geist`, `.app-atmosphere`, `.brand-wordmark`

## Projektstruktur

```
/
├── .cursor/skills/              # Agent Skills (DE)
├── public/
│   ├── data/
│   │   ├── clinics.json         # Build-Fallback
│   │   ├── clinics-meta.json
│   │   └── clinics.seed.json
│   ├── fonts/                   # Geist Sans / Mono
│   └── favicon.svg
├── scripts/
│   └── crawl-clinics.ts
├── src/
│   ├── components/
│   │   ├── ui/                  # Button, Card, Select, Slider, …
│   │   ├── icons/               # AnimatedIcon-Helfer
│   │   ├── FertilityApp.tsx
│   │   ├── UserInputForm.tsx
│   │   ├── ResultsDashboard.tsx
│   │   ├── ClinicCard.tsx
│   │   ├── ClinicsDirectoryPage.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── TreatmentToggle.tsx
│   ├── crawler/                 # Allowlist-Crawler
│   ├── lib/
│   │   ├── types.ts
│   │   ├── countryLogic.ts
│   │   ├── loadClinics.ts
│   │   ├── theme.ts
│   │   ├── countryCodes.ts
│   │   ├── treatments.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── kliniken.astro       # EU-Klinikverzeichnis
│   │   └── api/clinics.ts
│   └── styles/
│       └── globals.css
├── tests/crawler/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Agent Skills

Unter `.cursor/skills/` (und spiegelbildlich in `~/.cursor/skills/`):

| Skill | Zweck |
|-------|--------|
| `ux-review` | Heuristik-Reviews nach Nielsen Norman |
| `seo-geo` | SEO und Generative Engine Optimization |
| `ui-design` | Layout, Spacing, Typo, Komponenten |
| `accessibility-wcag` | WCAG 2.2 AA |
| `dev-best-practices` | Code, Tests, CI, PRs |
| `product-owner` | Backlog, JTBD, Priorisierung |

## Unterstützte Länder (Logik)

Die Empfehlungslogik deckt unter anderem ab:

- Deutschland — hohe Standards, Kassenaspekte für verheiratete Paare
- Tschechien — Preis-Leistung, Eizellspende legal
- Polen — günstig, kurze Anreise
- Spanien — liberale Regelungen für viele Familienmodelle
- Griechenland — liberal, oft günstiger als Spanien

Zusätzliche Kliniken können über Crawler-Allowlist und Seed-JSON in weiteren EU-Ländern liegen.

## Geschäftslogik

Berücksichtigt werden u. a.:

- Altersgrenzen und Beziehungsstatus je Land
- Verfügbarkeit von IVF, ICSI, Spende, PID
- Budgetwarnungen
- Entfernung (Referenz Berlin / gewählter Wohnort)
- Hinweise zur Kostenübernahme (Deutschland)

Anpassungen: `src/lib/countryLogic.ts`.

## Klinikdaten erweitern

Bevorzugt über Allowlist und Crawl:

1. Quelle in `src/crawler/sources.json` ergänzen
2. `npm run crawl:clinics` ausführen

Oder Seed/Fallback manuell in `public/data/` pflegen. Beispielstruktur einer Klinik:

```json
{
  "id": "unique-id",
  "name": "Klinikname",
  "country": "germany",
  "countryCode": "DE",
  "city": "Stadt",
  "rating": 4.8,
  "website": "https://example.com",
  "specialties": ["ivf", "icsi", "egg-donation"],
  "approximateCost": {
    "ivf": 3500,
    "icsi": 4500
  }
}
```

## Dokumentation (Crawler)

- Spec: `docs/superpowers/specs/2026-07-16-clinic-crawler-design.md`
- Plan: `docs/superpowers/plans/2026-07-16-clinic-crawler.md`

## Lizenz

Zu Bildungs- und Demonstrationszwecken erstellt.

## Hinweis

Die Empfehlungen basieren auf allgemeinen Informationen und ersetzen keine individuelle medizinische oder rechtliche Beratung. Bitte Fachärzte konsultieren und aktuelle Bestimmungen in den jeweiligen Ländern prüfen.
