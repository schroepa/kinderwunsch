---
name: accessibility-wcag
description: >-
  Prüft und verbessert Barrierefreiheit nach WCAG 2.2 (Ziel AA): Semantik,
  Tastatur, Fokus, Kontrast, Formulare, Screenreader und Target Size. Immer
  nutzen bei Accessibility, a11y, WCAG, ARIA, Screenreader, Keyboard-Navigation,
  Fokusfallen, Kontrast, Alt-Text, Formular-Labels oder wenn UI „barrierefrei“
  bzw. „zugänglich“ sein soll.
---

# Accessibility (WCAG 2.2)

## Zielniveau

Standard: **WCAG 2.2 Level AA**. AAA nur auf Wunsch oder für spezielle Anforderungen.

Vier Prinzipien (**POUR**): Perceivable, Operable, Understandable, Robust.

## Workflow

1. **Scope** — Seite/Flow/Komponente; Zielniveau bestätigen (AA).
2. **Semantik zuerst** — Native HTML vor ARIA; korrekte Roles nur wenn nötig.
3. **Tastatur** — Alles erreichbar, bedienbar, ohne Falle; sichtbarer Fokus.
4. **Wahrnehmung** — Kontrast, Text-Alternativen, nicht allein über Farbe.
5. **Formulare & Fehler** — Labels, Beschreibungen, Fehlermeldungen verknüpft.
6. **Automatisiert + manuell** — axe/lighthouse ≠ fertig; Keyboard + ein SR-Stich.
7. **Findings** — Mit SC-Nummer (z. B. 2.4.7) und Fix ausgeben.

## AA-Kern-Checkliste

### Perceivable
- [ ] Bilder/Icons mit Info: sinnvolles `alt` (dekorativ: `alt=""`)
- [ ] Kontrast Text ≥ 4.5:1 (groß ≥ 3:1); UI-Komponenten/Grafiken ≥ 3:1
- [ ] Info nicht nur über Farbe
- [ ] Video/Audio: Captions/Alternativen wo relevant
- [ ] Reflow/Zoom auf 200% ohne Verlust kritischer Funktion

### Operable
- [ ] Alles per Tastatur bedienbar (2.1.1)
- [ ] Keine Keyboard-Trap
- [ ] Skip-Link oder vergleichbare Sprungmarke
- [ ] Sichtbarer Fokus; Fokus nicht verdeckt (2.4.11 Focus Not Obscured)
- [ ] Target Size mindestens **24×24 CSS-px** (2.5.8), außer Ausnahmen
- [ ] Dragging hat Alternative (2.5.7)
- [ ] Bewegungen abschaltbar / `prefers-reduced-motion`

### Understandable
- [ ] Sprache der Seite (`lang`)
- [ ] Konsistente Navigation/Hilfe (3.2.6)
- [ ] Labels und Instructions
- [ ] Fehler identifiziert und Korrekturvorschläge wo möglich
- [ ] Redundante Eingaben vermeiden/auto-füllen (3.3.7)
- [ ] Accessible Authentication — kein reines Abtippen/Puzzle als einzige Methode (3.3.8)

### Robust
- [ ] Valides, sinnvolles DOM; Name/Role/Value für Custom Controls (ARIA)
- [ ] Statusmeldungen über `aria-live` / Role `status`/`alert` wo nötig

## ARIA-Regeln (kurz)

1. **Don’t use ARIA** wenn natives Element reicht (`button`, `a`, `input`, …).
2. Sichtbarer Name muss zugänglichen Namen matchen.
3. Interaktive Custom Widgets: Rollen + Keyboard-Pattern aus APG.
4. `aria-hidden` nicht auf fokussierbare Elemente ohne Strategie.

## Ausgabeformat

```markdown
# A11y Review: [Scope] (WCAG 2.2 AA)

## Summary
…

## Blocker (A/AA)
### [SC x.x.x] Titel
- Wo: …
- Problem: …
- Fix: …
- Test: Keyboard | SR | axe | Visuell

## Weitere AA-Issues
…

## Empfohlene Tests
- [ ] Tab-Order durch den Flow
- [ ] Screenreader-Stich (VoiceOver/NVDA)
- [ ] 200% Zoom / 320px Breite
```

## Neue SC in 2.2 (besonders prüfen)

Siehe [references/wcag-22-aa.md](references/wcag-22-aa.md).

## Quellen

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [How to Meet WCAG (Quickref)](https://www.w3.org/WAI/WCAG22/quickref/)
- [What’s new in 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [ARIA Authoring Practices (APG)](https://www.w3.org/WAI/ARIA/apg/)
