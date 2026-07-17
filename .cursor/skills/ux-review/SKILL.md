---
name: ux-review
description: >-
  Führt UX-Heuristik-Reviews und Flow-Analysen nach Nielsen Norman durch,
  priorisiert Usability-Probleme und schlägt konkrete Fixes vor. Immer nutzen
  bei UX-Review, Usability, Heuristik-Evaluation, User Flows, Onboarding,
  Formular-Friction, Conversion-Problemen oder wenn gefragt wird, ob ein Screen
  „verständlich“ oder „benutzbar“ ist — auch ohne explizite Erwähnung von UX.
---

# UX Review

## Wann dieser Skill greift

Lies diese Datei vollständig, bevor du UX-Feedback gibst. Ziel: schnelle, evidenzbasierte Heuristik-Reviews — kein Ersatz für echte Usertests.

## Workflow

1. **Scope klären** — Welcher Flow/Screen? Welches User-Ziel? Welche Plattform (Mobile/Desktop)?
2. **Ziel & Kontext** — Job des Users in einem Satz: „Nutzer will X erreichen, unter Bedingung Y.“
3. **Flow skizzieren** — Schritte als Sequenz (nicht nur einzelne Screens).
4. **Heuristik-Pass** — Jeden Schritt gegen die 10 NN/g-Heuristiken prüfen (siehe unten).
5. **Findings priorisieren** — Severity 0–4; nur actionable Issues ausgeben.
6. **Fixes vorschlagen** — Konkrete Design-/Copy-/Interaktionsänderungen, nicht nur Kritik.
7. **Offene Research-Fragen** — Was nur ein Usertest klären kann, explizit markieren.

## Die 10 Usability-Heuristiken (NN/g)

1. **Sichtbarkeit des Systemstatus** — Feedback nach jeder Aktion (Loading, Erfolg, Fehler).
2. **Übereinstimmung mit der realen Welt** — Sprache der Nutzer, natürliche Reihenfolge.
3. **Nutzerkontrolle & Freiheit** — Undo, Abbrechen, Zurück, Escape aus Irrwegen.
4. **Konsistenz & Standards** — gleiche Begriffe/Muster; Plattform-Konventionen einhalten.
5. **Fehlervermeidung** — Constraints, Defaults, Bestätigung für destruktive Aktionen.
6. **Wiedererkennen statt Erinnern** — Optionen sichtbar; kein Gedächtnis-Zwang.
7. **Flexibilität & Effizienz** — Shortcuts/Defaults für Geübte, ohne Anfänger zu blockieren.
8. **Ästhetik & Minimalismus** — nur relevante Info; keine konkurrierenden CTAs ohne Grund.
9. **Fehler erkennen, diagnostizieren, beheben** — klare Fehlermeldung + nächster Schritt.
10. **Hilfe & Dokumentation** — kontextuell, kurz, suchbar — wenn nötig.

Details und Beispiele: [references/heuristiken.md](references/heuristiken.md)

## Severity-Skala

| Stufe | Bedeutung | Handlung |
|------|-----------|----------|
| 4 | Blocker — Ziel unerreichbar | Sofort fixen |
| 3 | Schwerwiegend — großer Friction/Fehlerrisiko | Vor Release |
| 2 | Mittel — spürbar, Workaround möglich | Nächste Iteration |
| 1 | Kosmetik / leichte Irritation | Backlog |
| 0 | Kein echtes Problem / Geschmack | Ignorieren oder notieren |

## Ausgabeformat

```markdown
# UX Review: [Flow/Screen]

## Kontext
- User-Ziel: …
- Scope: …
- Plattform: …

## Zusammenfassung
1–3 Sätze zum Gesamtbild.

## Findings (priorisiert)
### [S4] Kurztitel
- Heuristik: #…
- Wo: …
- Problem: …
- Fix: …
- Evidenz: Heuristik | Annahme | Observation

## Quick Wins
- …

## Nur per Usertest klärbar
- …
```

## Regeln

- Flows vor Einzel-Screens bewerten.
- Heuristik-Verletzung ≠ Usertest-Ergebnis — als Hypothese kennzeichnen.
- Keine Feature-Wünsche als UX-Findings tarnen.
- Mobile-First prüfen, wenn die App mobil genutzt wird.
- Bei Design-Aufgaben parallel `ui-design` und `accessibility-wcag` berücksichtigen.

## Quellen

- [NN/g: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [NN/g: How to Conduct a Heuristic Evaluation](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/)
