# Product Owner — Templates

## Acceptance Criteria (Beispiel)

```markdown
### AC — Kliniksuche speichern
- [ ] Given ich habe Filter gesetzt, When ich „Suche speichern“ wähle,
      Then erscheint die Suche unter „Gespeichert“ mit Name + Datum
- [ ] Given ich bin ausgeloggt, When ich speichern will,
      Then werde ich zum Login geführt und kehre danach zum gleichen State zurück
- [ ] Given ich lösche eine gespeicherte Suche, When ich bestätige,
      Then ist sie entfernt und Undo 5s verfügbar
```

## RICE (kurz)

`Score = (Reach × Impact × Confidence) / Effort`

- Reach: Nutzer/Zeitraum
- Impact: 0.25–3 Skala
- Confidence: % (oder 0–1)
- Effort: Personenwochen

Score ist Diskussionshilfe, kein Autopilot.

## MoSCoW Release-Cut

- **Must** — ohne das kein Release / legal / Kernjob unmöglich
- **Should** — wichtig, Workaround existiert
- **Could** — nice-to-have wenn Kapazität
- **Won’t** (diesmal) — explizit kommunizieren

## Opportunity Solution Tree (Skizze)

```text
Business Outcome
 └─ Opportunity (Nutzerbedarf/-job)
     ├─ Solution A → Experiment
     ├─ Solution B → Experiment
     └─ Solution C → Experiment
```

Nur Solutions weiterverfolgen, die an eine belegte Opportunity hängen.

## Definition of Ready (Team-Beispiel)

- [ ] Job/Nutzen klar
- [ ] AC geschrieben
- [ ] Dependencies bekannt
- [ ] Design/Copy ausreichend für Umsetzung
- [ ] Team kann schätzen/slicen
- [ ] Testbarkeit gegeben

## Definition of Done (Team-Beispiel)

- [ ] AC erfüllt
- [ ] Reviewed + Tests grün
- [ ] A11y-Grundcheck bei UI
- [ ] Analytics/Telemetry falls nötig
- [ ] Dokumentation/Changelog wenn Nutzer-sichtbar
