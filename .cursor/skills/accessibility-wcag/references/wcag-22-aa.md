# WCAG 2.2 — AA-Fokus & neue Kriterien

## POUR → Guidelines (Überblick)

1. **Perceivable** — 1.1 Textalternativen, 1.2 Zeitbasierte Medien, 1.3 Anpassbar, 1.4 Unterscheidbar
2. **Operable** — 2.1 Tastatur, 2.2 Zeit, 2.3 Anfälle, 2.4 Navigierbar, 2.5 Eingabemodalitäten
3. **Understandable** — 3.1 Lesbar, 3.2 Vorhersehbar, 3.3 Eingabeunterstützung
4. **Robust** — 4.1 Kompatibel

Conformance = Success Criteria erfüllen. **4.1.1 Parsing** ist in 2.2 obsolete/entfernt.

## Neu bzw. zentral in 2.2 (für Reviews)

| SC | Level | Kurz |
|----|-------|------|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Fokussiertes Element nicht vollständig verdeckt (Sticky Header/Cookie-Banner!) |
| 2.5.7 Dragging Movements | AA | Alternative zu Drag-only |
| 2.5.8 Target Size (Minimum) | AA | ≥ 24×24 CSS-px (mit Ausnahmen) |
| 3.2.6 Consistent Help | A | Hilfe-Mechanismen an konsistenter Stelle |
| 3.3.7 Redundant Entry | A | Bereits eingegebene Infos nicht erneut verlangen |
| 3.3.8 Accessible Authentication (Minimum) | AA | Kein Cognitive Function Test als einzige Auth |

(AAA-Varianten 2.4.12, 2.4.13, 3.3.9 nur bei Bedarf.)

## Häufige Web-Fails

- Icon-Buttons ohne accessible name
- Platzhalter als Label-Ersatz
- Fokus-Outline entfernt ohne Ersatz
- Modals: Fokus nicht eingefangen / nicht restored
- `div onClick` statt `button`
- Fehlermeldung nicht mit `aria-describedby` / `aria-invalid` verknüpft
- Kontrast Primary-on-Primary-Tint zu schwach
- Cookie-Banner verdeckt Fokus oder Blocks

## Test-Reihenfolge (pragmatisch)

1. Automatisiert (axe) — Low-hanging fruit
2. Nur Tastatur durch Happy Path + Error Path
3. Zoom 200% + schmale Viewport
4. Screenreader: Landmarks, Headings, Form-Labels, Live-Regions
5. Reduced motion prüfen
