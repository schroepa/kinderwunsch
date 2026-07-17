# Gestalt & Spacing — Detail

## Proximity-Ratio (Formulare)

```
[Label]
  ↕ d1 (klein)
[Input]
  ↕ d2 (größer, ≥ 2× d1)
[Nächstes Label]
```

Wenn `d1 ≈ d2`, wirkt das Label „herrenlos“. Ziel: `d1 ≤ 0.5 × d2`.

## Semantische Spacing-Tokens (Beispiel)

| Token | Intent |
|-------|--------|
| `space-near` / `in-group` | Label–Feld, Icon–Text, Titel–Unterzeile |
| `space-between` | Zwischen verwandten Controls in einer Gruppe |
| `space-away` / `inter-group` | Zwischen Sektionen/Karten |
| `space-section` | Große Band-/Section-Abstände |

Absolute Werte dürfen sich ändern (Density), solange die **Ratios** stabil bleiben.

## Typo-Skala (Faustformel)

Modulare Skala (z. B. 1.2 oder 1.25) aus einer Base (16px). Nicht zu viele Stufen gleichzeitig auf einer Seite.

## Responsive Proximity

Beim Umbruch auf schmale Viewports:

- Gruppen nicht „zerreißen“ (zusammengehörige Elemente wrap’en zusammen).
- Abstände proportional skalieren, Ratio erhalten.
- Sticky/overlapping UI darf Fokus und Targets nicht verdecken (A11y).

## Elevation statt Border-Spam

1. Hintergrundwechsel (subtle)
2. 1px Border mit niedriger Opacity
3. Weicher Shadow nur für Floating/Popover

Weniger ist mehr — eine Strategie pro Surface-Typ.
