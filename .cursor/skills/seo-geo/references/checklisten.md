# SEO/GEO — erweiterte Checklisten

## Intent-Typen

| Intent | Content-Form |
|--------|----------------|
| Informational | Definition + Schritte + FAQ |
| Commercial investigation | Vergleichstabellen, Kriterien, Trade-offs |
| Transactional | Klare CTA, Vertrauen, Preis/Leistung sichtbar |
| Navigational | Brand/Produkt klar, schnelle Pfade |

## Schema (Auswahl)

Nur einsetzen, wenn Markup = sichtbarer Inhalt:

- `Organization` / `WebSite`
- `Article` / `BlogPosting` (Autor, Datum)
- `FAQPage` (nur echte sichtbare FAQs)
- `BreadcrumbList`
- `Product` / `Offer` (Shop)
- `LocalBusiness` (Local SEO)

Validieren (z. B. Rich Results Test). Kein Schema „für AI“ erfinden.

## E-E-A-T Signale (praktisch)

- Autor/Expertise sichtbar (besonders YMYL: Gesundheit, Finanzen, Recht)
- Quellenangaben und Aktualität
- Kontakt/Impressum/About
- Konsistente NAP und Entity-Präsenz (wo relevant)
- Keine irreführenden Claims

## GEO Content-Muster

1. **Definition → Bullets → Tabelle**
2. **Statistik → Quelle → Implikation**
3. **Frage (H2) → Kurzantwort → Vertiefung**
4. **Vergleichstabelle** mit klaren Spaltenköpfen

## Mess-KPIs

- Impressions/Clicks/Position (Search Console)
- Index-Abdeckung, Core Web Vitals
- AI: manuelle Prompt-Stichproben; Citation-Share (directionell, nicht absolut)
- AI-Referral-Traffic (falls messbar in Analytics)

## Anti-Patterns

- Keyword-Stuffing / doorway pages
- Thin AI-Content ohne Mehrwert
- FAQ-Schema ohne FAQ auf der Seite
- `noindex` + „bitte ranken“
- Nur Client-rendered kritischer Text ohne SSR/Prerender-Strategie
