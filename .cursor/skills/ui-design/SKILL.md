---
name: ui-design
description: >-
  Leitet UI-Design-Entscheidungen zu Layout, Typografie, Spacing, Hierarchie,
  Farbe und Komponenten nach Gestalt-Prinzipien und Design-System-Praxis. Immer
  nutzen bei UI, Visual Design, Layout, Spacing, Typo, Design Tokens, Komponenten-
  Styling, Landingpages, Redesigns oder wenn etwas „unaufgeräumt“, „generisch“
  oder „uneinheitlich“ wirkt — auch ohne explizites „UI-Design“.
---

# UI Design

## Prinzip

Gute UI kommuniziert Struktur **vor** dem Lesen: Nähe, Ähnlichkeit, Ausrichtung und Kontrast steuern Aufmerksamkeit. Tokens und wenige klare Entscheidungen schlagen dekorative Komplexität.

Bestehende Design-Systeme und Projekt-Regeln haben Vorrang vor generischen Trends.

## Workflow

1. **Job der Ansicht** — Ein primärer Zweck pro Viewport/Section.
2. **Hierarchie** — Brand/Headline/Supporting/CTA/Visual in klarer Reihenfolge.
3. **Gruppierung** — Gestalt: Proximity, Similarity, Common Region, Continuity.
4. **Tokens** — Spacing, Type, Color, Radius, Shadow aus dem System — keine Magic Numbers.
5. **Zustände** — Default, Hover, Focus, Active, Disabled, Error, Empty, Loading.
6. **Responsive** — Gruppierungen bleiben auf Mobile erhalten (Proximity-Ratio!).
7. **A11y-Kopplung** — Kontrast, Focus, Target Size mit `accessibility-wcag` abstimmen.

## Gestalt — UI-Kernregeln

| Prinzip | Praxis |
|---------|--------|
| **Proximity** | Zusammengehöriges enger; Gruppenabstand ≥ 2× Innenabstand. Label→Feld ≤ 50% von Feld→nächstes Label |
| **Similarity** | Gleiche Funktion = gleiches Aussehen |
| **Common Region** | Karten/Flächen nur wenn sie Interaktion/Verständnis tragen |
| **Continuity** | Lesefluss und Scan-Pfad (F/Z) unterstützen |
| **Figure/Ground** | Primäre Aktion klar vom Hintergrund getrennt |

## Spacing

- Basis: **4px-Einheit**, Rhythmus oft **8-Punkt** (8, 16, 24, 32, 48, 64).
- Semantische Tokens bevorzugen (`in-group`, `between-groups`, `section`) statt nur `space-1…n`.
- Padding innen, `gap` zwischen Geschwistern — nicht überall Margin-Hacks.
- Gleichmäßiger Abstand überall = keine Hierarchie.

## Typografie

- Wenige Rollen: Display, Heading, Body, Detail/Meta (Mono für Daten ok).
- Body Line-Height ~1.4–1.6; Maß **45–75 Zeichen** (`max-width: ~65ch` für Fließtext).
- Tracking enger bei großen Display-Sizes; Labels ggf. tracked + uppercase (sparsam).
- Max. **2 Font-Weights** pro View, wenn möglich.

## Farbe & Surfaces

- Neutrale Surfaces + **eine** klare Accent-Farbe für Primary-Aktionen.
- Borders ultra-fein oder über Elevation/Hintergrund lösen — keine schweren Rahmen ohne Grund.
- Shadows dezent und konsistent (Design-System), nicht „Glow-Stack“.

## Komponenten-Hierarchie

- **Ein Primary-CTA** pro View.
- Secondary = Outline/Ghost; Destructive klar getrennt.
- Controls: ausreichend Touch-Target (siehe A11y ≥24×24 CSS-px Minimum AA).
- Keine Cards im Hero, außer das System verlangt es; Cards für interaktive Einheiten.

## Anti-Patterns (AI-Design-Klischees vermeiden)

- Lila-auf-Weiß / generische Gradient-Heroes ohne Markenbezug
- Überall `rounded-full` Pills + Multi-Shadow + Glow
- Stat-Strips und Badge-Cluster im ersten Viewport ohne Job
- Emoji als UI-Ersatz für Icons

Projekt-spezifische Frontend-Regeln immer zusätzlich beachten.

## Ausgabeformat

```markdown
# UI Review / Richtung: [View]

## Visuelle Hierarchie
…

## Spacing & Gruppierung
…

## Typo / Farbe / Komponenten
…

## Konkrete Token-/CSS-Empfehlungen
…

## Verstöße / Quick Fixes
…
```

## Quellen

- [NN/g: Proximity](https://www.nngroup.com/articles/gestalt-proximity/)
- Gestalt-Übersichten und Spacing-Token-Praxis (Design Systems, 4/8-Grid)
- Details: [references/gestalt-spacing.md](references/gestalt-spacing.md)
