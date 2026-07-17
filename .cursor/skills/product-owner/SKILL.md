---
name: product-owner
description: >-
  Unterstützt Product-Owner-Arbeit: Product Goal, Discovery (JTBD), Backlog,
  Priorisierung, User/Job Stories, Acceptance Criteria und Outcome-Roadmaps.
  Immer nutzen bei Product Owner, Backlog, User Stories, Priorisierung, Roadmap,
  Sprint Planning, PRD, Scope-Schnitt, MoSCoW/RICE, Stakeholder-Trade-offs oder
  wenn „was bauen wir als Nächstes?“ entschieden werden soll.
---

# Product Owner

## Rolle (Scrum Guide)

Der Product Owner ist **eine Person** (kein Komitee), accountable für:

1. Product Goal entwickeln und kommunizieren
2. Product Backlog Items klar formulieren
3. Backlog **ordnen** (nicht nur „schätzen lassen“)
4. Backlog transparent, sichtbar, verstanden halten

Andere können zuliefern — Accountability bleibt beim PO. Organisation muss PO-Entscheidungen respektieren.

## Workflow

1. **Outcome klären** — Welches Nutzer-/Business-Ergebnis? (nicht Feature-Liste)
2. **Discovery** — Job/Problem validieren (JTBD, Evidenz, Annahmen)
3. **Options** — Lösungen als Experimente/Slices, nicht als Big Bang
4. **Backlog schneiden** — INVEST-Stories, klare AC, Dependencies/Risiken
5. **Priorisieren** — Value, Risiko, Lernen, Abhängigkeiten (RICE/MoSCoW/Wert×Risiko)
6. **Sprint/Iteration** — Sprint Goal vorschlagen; Scope mit Team verhandeln
7. **Review & Adapt** — Feedback → Backlog neu ordnen; Output ≠ Outcome prüfen

## Jobs to Be Done (leichtgewichtig)

Job Story:

```text
Wenn [Situation],
möchte ich [Motivation],
damit ich [Ergebnis].
```

- Functional + Emotional + Social Dimension kurz notieren
- Wettbewerb inkl. Workarounds (Excel, WhatsApp, „nichts tun“)
- Priorisiere Jobs mit **hoher Wichtigkeit / niedriger Satisfaction**

## Backlog Item Qualität

Jedes Item sollte enthalten:

- **Nutzer/Job** und Problemkontext
- **Nutzen** (warum jetzt?)
- **Acceptance Criteria** (prüfbar, Given/When/Then oder Checkliste)
- **Out of Scope** (explizit)
- **Messung** (welche Metrik ändert sich?)
- Risiken, Dependencies, Skizzen/Links

### INVEST (Faustregel)

Independent, Negotiable, Valuable, Estimable, Small, Testable.

## Priorisierung

| Methode | Wann |
|---------|------|
| **Wert / Risiko / Dependency** | Default für Ordering |
| **MoSCoW** | Scope-Cut für Release |
| **RICE** | Relative Scores bei vielen Options |
| **Kano** | Basis vs. Begeisterung verstehen |

„Alles Must“ ist kein Ordering — innerhalb von Must weiter sortieren.

## Roadmap

- Nach **Outcomes/Jobs** strukturieren, nicht nur Feature-Quartale
- Now / Next / Later mit Unsicherheit sichtbar
- Shipping ist Mittelpunkt, nicht Ziel — Adoption & Outcome tracken

## Ausgabeformate

### Story

```markdown
## [Titel]

**Job Story:** Wenn … möchte ich … damit …

**Hintergrund:** …
**AC:**
- [ ] …
**Out of Scope:** …
**Metrik:** …
**Priorität / Rationale:** …
```

### Priorisierungs-Empfehlung

```markdown
# Backlog-Empfehlung

## Product Goal (1 Satz)
…

## Top 5 (geordnet)
1. … — warum
…

## Explizit später / Nein
…

## Offene Annahmen
…
```

## Anti-Patterns

- Feature-Factory ohne Outcome
- Stakeholder-Kommitee priorisiert am PO vorbei
- Stories ohne AC („wie bisher, nur besser“)
- Roadmap als Commitment-Vertrag ohne Lernschleifen
- Zu große Items ohne Slice-Strategie

## Vertiefung

[references/templates.md](references/templates.md)

## Quellen

- [Scrum Guide — Product Owner](https://scrumguides.org/scrum-guide.html)
- JTBD / Job Stories (Christensen/Moesta; praxisnahe PO-Guides)
- Value-based Prioritization (Value, Risk, Dependencies)
