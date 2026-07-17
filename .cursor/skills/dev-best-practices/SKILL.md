---
name: dev-best-practices
description: >-
  Wendet Software-Entwicklungs-Best-Practices an: sauberer Code, Tests,
  kleine PRs, CI/Shift-Left, Sicherheit und Wartbarkeit — besonders bei
  AI-generiertem Code. Immer nutzen bei Implementierung, Refactoring, Code-Review,
  Teststrategie, CI/CD, PR-Qualität, Tech-Debt oder wenn gefragt wird, ob Code
  „production-ready“, „clean“ oder „maintainable“ ist.
---

# Development Best Practices

## Leitidee (AI-Zeitalter)

Code schreiben ist billig; **Verstehen und Warten** ist teuer. Agents brauchen schnelles Feedback (Tests, Typen, Linter). Bevorzuge Klarheit, stabile Grenzen und prüfbare Inkremente.

Stack-spezifische Skills (z. B. React/Vercel) ergänzen diesen Skill — nicht ersetzen.

## Workflow bei Feature/Fix

1. **Ziel & Akzeptanz** — Was ist „done“? Edge Cases?
2. **Kleinster sicherer Schnitt** — Bestehende Patterns im Repo lesen und folgen.
3. **Implementieren** — SRP, klare Namen, Fehlerpfade bewusst.
4. **Tests** — Verhalten absichern (Pyramid); bei Refactor zuerst Characterization.
5. **Statisch prüfen** — Types, Lint, Format.
6. **Review an sich selbst** — Diff lesen wie ein Reviewer; Secrets? Scope creep?
7. **Verifizieren** — Relevante Commands wirklich ausführen, bevor „fertig“ behauptet wird.

## Clean Code — Kern

- **Namen** drücken Absicht aus (keine `data2`, `handleStuff`).
- Funktionen/Module: **eine Verantwortung**; lieber klein und komponierbar.
- Side Effects sichtbar halten; I/O an den Rändern.
- Duplikation vermeiden — aber keine falsche Abstraktion zu früh (Rule of Three).
- Fehler: klar werfen/mappen; nicht schlucken; User-facing Messages trennen von Logs.
- Kommentare erklären **Warum**, nicht What; tote Code-Pfade löschen.

## Tests — Pyramid

```
      /\
     /E2E\        wenige, kritische Journeys
    /------\
   /Integr.\     Grenzen, API, DB-Contracts
  /----------\
 /   Unit     \   viel, schnell, deterministisch
/--------------\
```

- Flaky Tests sofort quarantine/fixen — sie zerstören Signal.
- AI-Assistenten: mehr Tests für Edge Cases generieren lassen, aber Assertions prüfen.
- Coverage-Gates nur als Trend/Minimum — nicht Gaming.

## CI / Shift-Left

- Jeder Commit/PR: Build + Unit/Integration + Lint/Typecheck
- Security früh: Dependency-Scan, Secret-Scan, SAST wo vorhanden
- Pipeline als Code; Feedback möglichst **< 10 Min** für den Hot Path
- Main immer releasbar halten; Feature Flags für riskante Rollouts

## PRs & Zusammenarbeit

- Klein, thematisch fokussiert; Beschreibung: Warum + Testplan
- Keine Secrets (`.env`, Keys) committen
- Nicht amenden/forcen ohne explizite Anweisung; Hooks nicht skippen
- Review-Feedback: Korrektheit > Style-Nits; Security/Data-Loss = Blocker

## Anti-Patterns

- Große „drive-by“ Refactors gemischt mit Features
- `any`/ignorierte Errors „damit es baut“
- Tests auskommentieren statt fixen
- Framework-Hopping ohne Bedarf
- Premature Microservices / Over-Engineering

## Ausgabeformat (Review)

```markdown
# Dev Review: [Scope]

## Blocker
- …

## Risiken / Korrektheit
- …

## Tests & Observability
- …

## Maintainability
- …

## Empfohlene nächsten Schritte
1. …
```

## Vertiefung

Siehe [references/checkliste.md](references/checkliste.md).

## Quellen

- Clean Code-Prinzipien (Martin u. a.) — angewandt auf AI-assisted Dev
- Test Automation Pyramid; Continuous Testing
- DORA/CI-Praxis: Shift-Left, schnelle Pipelines, progressive Delivery
