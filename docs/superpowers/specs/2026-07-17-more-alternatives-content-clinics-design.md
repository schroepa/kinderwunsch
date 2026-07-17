# Mehr Alternativen, Wissen & Kliniken — Design

**Date:** 2026-07-17  
**Status:** Approved for implementation planning (Phase 1 confirmed; Phases 2–3 sequenced)  
**App:** Kinderwunsch-Finder  
**Approach:** App-first (Tool bleibt Kern; Content und Klinikdaten wachsen drumherum)

## Goal

Nutzer:innen sollen nach der Eingabe **mehr sinnvolle Alternativen** sehen (Länder und Kliniken), sich in der App **über das Thema informieren** können (SEO-fähige Guides), und langfristig **mehr Kliniken mit nachvollziehbarer Datenqualität** finden — ohne das Empfehlungs-Tool als Kern zu verlieren.

## Product decisions (Discovery)

| Entscheidung | Wahl |
|--------------|------|
| Scope | Alle drei Bausteine (Ergebnisse, Wissen, Kliniken) |
| Reihenfolge | Phase 1 Ergebnisse → Phase 2 Wissen → Phase 3 Klinikvolumen |
| „Mehr Alternativen“ | Länder **und** Kliniken (Top prominent + „Weitere…“) |
| Content-Tiefe | Stark / SEO-fähig; in Phase 2 noch **ohne** externes CMS |
| Klinikdaten | Hybrid: kuratierter Kern + Directory-Crawler |

## Non-goals (gesamt)

- Medizinische Beratung oder personalisierte Therapieempfehlungen
- Open-ended Web-Crawling / ungeprüfte Discovery
- Community, Chat, Arzt-Vermittlung
- Erfolgsraten als „garantierte“ Kennzahlen (nur mit Quellen/Disclaimer, wenn überhaupt)
- Externes Headless-CMS in Phase 1–2 (Anbindung erst vorbereiten)

## Phased delivery

```
Phase 1 (Now)          Phase 2 (Next)           Phase 3 (Later)
─────────────          ──────────────           ───────────────
Results UX +           Astro MDX Wissen         Hybrid Klinikvolumen
Länder-Scoring +       /wissen + SEO            Directory-Quellen +
Klinik-Filter/Sort     Context-Links            reicheres Modell
```

---

## Phase 1 — Mehr Alternativen in den Ergebnissen

### Outcome

Nach „Empfehlungen anzeigen“ sieht die Nutzer:in klar priorisierte Optionen **und** weitere legale Alternativen; pro Land passende Kliniken mit Sortierung, nicht nur 2–3 Roh-Einträge.

### Current state (baseline)

- `getCountryRecommendations` scored **5** Länder (DE, CZ, PL, ES, GR), returns **`slice(0, 4)`**.
- Klinikdaten: ~**20** Seed-Kliniken; in Results: alle mit `country === id`, keine Treatment-Filter, keine Sortierung.
- Seed enthält bereits Kliniken für AT, DK, NL, PT, IT, FR — **ohne** Scoring/Legal-Rules.

### Behaviour

#### Länderliste

1. Scoring erweitern um Länder, die bereits Klinikdaten bzw. klare EU-Relevanz haben: mindestens **AT, DK, NL, PT, IT, FR** (Legal-, Kosten-, Entfernungs- und Pros/Cons-Regeln analog zu bestehenden Ländern).
2. `forbidden` weiter ausblenden; `restricted` anzeigen mit Badge/Hinweis.
3. Sortierung nach `score` absteigend.
4. UI:
   - **Top 3** als primäre Empfehlungskarten (wie heute, aber fest Top 3 statt hart 4).
   - Darunter aufklappbarer Block **„Weitere Alternativen“** mit allen übrigen legalen Treffern (kein festes Limit außer „alle scored & erlaubt“).
5. Entfernen des harten `recommendations.slice(0, 4)` zugunsten von UI-Split (Top 3 / Rest).

#### Kliniken pro Land

1. Beim Aufklappen eines Landes: Kliniken laden (bestehende `loadClinics` / Force-Refresh).
2. Filter: Schnittmenge mit gewählten `treatments` (Klinik muss mindestens eine passende `specialty` haben; wenn nach Filter leer → Fallback „alle Kliniken dieses Landes“ + Hinweis).
3. Sortierung (stabil, dokumentiert):
   1. Passung (Anzahl überlappender Specialties, absteigend)
   2. Kosten (IVF/ICSI-Approximate, fehlende Kosten nach hinten)
   3. Entfernung (Heuristik über bestehendes Distance-Modell / Wohnort→Berlin-Nähe des Landes; Klinik-Geo erst in Phase 3)
4. UI: **Top 3 Kliniken**; Rest unter **„Weitere Kliniken“**.
5. Link zu `/kliniken` mit Query `?country=<id>` (oder gleichwertig) vorausgewählt.

### Key files (expected touchpoints)

- `src/lib/countryLogic.ts` — Länder, Legal, Score, Export ohne Slice-Cap
- `src/lib/types.ts` — ggf. Hilfstypen für Sort-Keys
- `src/components/ResultsDashboard.tsx` — Top/Weitere UI, Klinik-Filter/Sort
- `src/components/ClinicCard.tsx` — nur falls Sort-Meta sichtbar
- `src/components/ClinicsDirectoryPage.tsx` — Query-Param Land
- Tests unter `tests/` für Scoring + Sort/Filter

### Out of scope (Phase 1)

- Neue Crawl-Quellen / Seed-Massenimport
- CMS / `/wissen`
- Maps, Telefon, Erfolgsraten
- Änderung der Crawler-TTL/Batch-Limits

### Acceptance criteria (Phase 1)

- [x] Mindestens die heutigen 5 plus AT/DK/NL/PT/IT/FR sind im Scoring modelliert (Legal + Score + Kostenheuristik).
- [x] Bei typischer Eingabe erscheinen Top 3; „Weitere Alternativen“ zeigt ≥1 weiteren legalen Treffer, wenn vorhanden.
- [x] Forbidden-Länder erscheinen nicht; Restricted sind gekennzeichnet.
- [x] Aufgeklapptes Land filtert Kliniken nach Treatments (mit dokumentiertem Fallback).
- [x] Kliniken sind sortiert; UI zeigt Top 3 + „Weitere Kliniken“.
- [x] `/kliniken?country=…` filtert auf das Land.
- [x] Unit-Tests für Scoring-Erweiterung und Klinik-Sort/Filter.

### Messung (Phase 1)

- Anteil Sessions, die „Weitere Alternativen“ öffnen
- Anteil, die „Weitere Kliniken“ öffnen / zu `/kliniken` wechseln

---

## Phase 2 — Wissen & SEO (Content Collections)

### Outcome

Nutzer:innen können sich **in der App** zu Treatments, Kostenrahmen und Länderregeln informieren; Inhalte sind crawlbar und aus dem Tool verlinkt.

### Approach

- Astro **Content Collections** mit **MDX** (kein externes CMS in dieser Phase).
- Routen:
  - `/wissen` — Übersicht (Kategorien: Treatments, Länder, Praxis/FAQ)
  - `/wissen/[slug]` — Guide/Artikel
  - optional `/wissen/laender/[country]` — Deep-Dive (kann auch als Slug-Konvention laufen)
- Contextuelle Links:
  - Formular: Treatment-Erklärung → Guide
  - Ergebnisse: Land → Länder-Guide; Budget-Hinweis → Kosten-Guide
  - Footer / Nav: „Wissen“
- SEO: Title/Description, Canonical auf echte Production-Domain (`roser.vercel.app` bzw. spätere Custom Domain), Sitemap-Einträge, JSON-LD (`FAQPage` / `MedicalWebPage` wo passend), Disclaimer auf jeder Wissensseite.
- Content-Modell so, dass Felder (`title`, `description`, `category`, `relatedTreatments`, `relatedCountries`, `updatedAt`) später 1:1 aus einem Headless-CMS kommen können.

### Initial content set (Minimum viable library)

- Treatments: IVF, ICSI, Eizellspende, Samenspende, PID (je 1 Guide)
- Quer: „Was kostet eine Kinderwunschbehandlung?“, „Rechtliche Unterschiede in Europa (Überblick)“
- FAQ-Seite (häufige Fragen)
- Pro Kernland (DE, CZ, PL, ES, GR) kurzer Deep-Dive; weitere Länder nachziehen

### Out of scope (Phase 2)

- Sanity/Contentful/Live-Preview
- Autoren-Accounts, Kommentare
- KI-generierte ungeprüfte Medizintexte ohne redaktionelle Freigabe
- Map/mapcn (Marker oder Routes) — bewusst **nach** Phase 2 (Entscheidung 2026-07-17: zuerst Wissen, dann Geo-Spike)

### Acceptance criteria (Phase 2)

- [x] `/wissen` und mindestens 8 MDX-Seiten live.
- [x] Sitemap enthält Wissens-URLs; Meta/OG gesetzt.
- [x] Mindestens 3 Context-Links aus Tool → Wissen.
- [x] Medizinischer Disclaimer auf Wissensseiten.
- [x] Canonical/Site-URL auf die echte Vercel-Domain korrigiert.

### Messung (Phase 2)

- Organische / direkte Sessions auf `/wissen/*`
- Klickrate Wissen → Formular / Ergebnisse

---

## Phase 3 — Klinikvolumen (Hybrid)

### Outcome

Deutlich mehr Kliniken in EU; Nutzer:innen erkennen **kuratierte** vs. **Verzeichnis**-Einträge und fehlende Felder.

### Approach

- Seed bleibt Trusted-Core (handgepflegt, vollständigere Felder).
- `sources.json`: Directory-/Association-Quellen aktivieren (Allowlist only); bestehende Crawler-Architektur (`docs/superpowers/specs/2026-07-16-clinic-crawler-design.md`) nutzen.
- Modell-Erweiterung (inkrementell): sichtbare `languages`, optional Kontakt, erweiterte Kosten; fehlende Felder UI-seitig als unvollständig.
- Badges: **Kuratiert** (Seed/trusted) vs. **Aus Verzeichnis**; `stale` weiter anzeigen.
- Deduplizierung und Qualitätsregeln wie im Crawler-Design; keine offenen Crawls.

### Out of scope (Phase 3)

- User-generated Reviews als Wahrheitsquelle
- Garantierte Aktualität aller Kosten
- Erfolgsraten ohne belastbare öffentliche Quelle

### Acceptance criteria (Phase 3)

- [ ] Klinikanzahl deutlich über Seed-Baseline (Zielrichtung: ≥50 nach ersten Directory-Quellen; exakte Zahl abhängig von Quellenqualität).
- [ ] Badges Kuratiert / Verzeichnis in Card + Directory.
- [ ] Unvollständige Einträge erkennbar; Enrichment-Fehler erhöhen nicht „fake completeness“.
- [ ] Crawl-Meta/Stats weiterhin nachvollziehbar.

### Messung (Phase 3)

- `clinicCount` und Anteil mit `approximateCost` / `description`
- Nutzung Directory-Filter vs. Results-Expand

---

## Cross-cutting

### Trust & Compliance

- Bestehende medizinische Disclaimer beibehalten und auf Wissens-/Klinikseiten ausweiten.
- Keine Formulierung, die individuelle Therapieempfehlung suggeriert.
- Quellenangaben bei rechtlichen/kostenbezogenen Guides.

### Domain / SEO hygiene

- Site-URL, Canonical, Sitemap und robots auf die **echte** Production-Domain ausrichten (`roser.vercel.app` bzw. Custom Domain), nicht auf Platzhalter-Hosts.

### Dependencies between phases

- Phase 1 liefert UX-Muster „Top + Weitere“, die Phase 3 für Klinikvolumen wiederverwendet.
- Phase 2 kann Country-IDs aus Phase 1 für Deep-Dives nutzen.
- Phase 3 darf Phase-1-Sortierung um Geo/Kontakt erweitern, ohne UI-Vertrag zu brechen.

---

## Open questions (non-blocking for Phase 1 plan)

1. Exakte Legal-Regeln für AT/DK/NL/PT/IT/FR — erste Iteration konservativ (`restricted` bei Unsicherheit) vs. Recherche-Spike vor Coding?
2. Production Custom Domain — festlegen bevor Phase-2-SEO hardcodiert wird.
3. Wann Headless-CMS: nach Content-Product-Market-Fit (Traffic auf `/wissen`), nicht vorher.
4. Map/mapcn: Spike-Plan `docs/superpowers/plans/2026-07-17-map-spike-clinic-markers.md` — Marker auf `/kliniken` zuerst; MapRoute/OSRM später.

**Default für Planung Phase 1:** konservative Legal-Defaults + kurze Rule-Kommentare; Feinschliff der Landesregeln als Follow-up-Tickets.
