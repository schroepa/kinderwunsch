# Dev Best Practices — Checkliste

## Vor dem Codieren

- [ ] Anforderung/AC verstanden; Unklarheiten geklärt oder als Annahme dokumentiert
- [ ] Ähnliche Patterns im Repo gefunden
- [ ] Nicht im Scope bewusst ausgelassen

## Währenddessen

- [ ] Öffentliche APIs/Typen stabil und benannt
- [ ] Fehler- und Leer-Zustände behandelt
- [ ] Keine hart kodierten Secrets/URLs mit Credentials
- [ ] Logging ohne PII-Spam; sinnvolle Fehlergrenzen (UI/API)

## Tests

- [ ] Happy Path
- [ ] Mindestens ein Edge/Error Case
- [ ] Deterministisch (keine Zeit-/Netz-Flakes ohne Mock)
- [ ] Bei Bugfix: Regressionstest

## Vor „fertig“ / PR

- [ ] `lint` / `typecheck` / relevante `test` / `build` grün (projektspezifisch)
- [ ] Diff selbst gelesen
- [ ] Keine debug-only `console.log` / tote Flags
- [ ] Migrations/Backward Compatibility bedacht
- [ ] A11y-Grundlagen bei UI-Änderungen (Fokus, Labels) — Skill `accessibility-wcag`
- [ ] Performance-Regressions grob bedacht (große Listen, N+1, Bundle)

## Security Quick Pass

- [ ] Injection (SQL/HTML/Command) vermieden; Escaping/Parametrisierung
- [ ] AuthZ an jeder sensiblen Grenze
- [ ] CSRF/CORS/Cookies nach Stack-Standards
- [ ] Dependencies nicht leichtfertig mit kritischen CVEs

## Definition of Ready for Merge

Kleine, getestete Änderung; Review möglich; Rollback-Idee vorhanden; Docs nur wenn Verhalten für Nutzer/Devs sonst unklar bleibt.
