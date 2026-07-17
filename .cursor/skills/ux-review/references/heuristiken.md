# Nielsen-Heuristiken — Kurzreferenz

## 1. Visibility of System Status
Nutzer wissen jederzeit, was das System tut. Sofortiges Feedback (≤100ms wahrgenommen), Progress für längere Ops, klare Zustände (idle/loading/success/error).

**Typische Verstöße:** Submit ohne Spinner; Hintergrund-Sync unsichtbar; unklare „Speichern…“-Zustände.

## 2. Match Between System and Real World
Worte, Icons, Reihenfolge wie in der Nutzerwelt — kein Internjargon.

**Typische Verstöße:** „Entity sync failed“ statt „Verbindung fehlgeschlagen. Erneut versuchen.“

## 3. User Control and Freedom
Notausgänge: Abbrechen, Undo, Zurück, Draft verwerfen.

**Typische Verstöße:** Modal ohne Escape; Wizard ohne Zurück; irreversibles Löschen ohne Confirm.

## 4. Consistency and Standards
Interne Konsistenz + Plattform-Standards (iOS/Android/Web).

**Typische Verstöße:** „Speichern“ vs. „Übernehmen“ für dieselbe Aktion; Primary-Button mal links, mal rechts.

## 5. Error Prevention
Besser verhindern als nachträglich erklären: Constraints, sinnvolle Defaults, Vorschau, Confirm bei Risiko.

**Typische Verstöße:** Freitext für Datumsfelder; Löschen neben Speichern gleich gestylt.

## 6. Recognition Rather Than Recall
Sichtbare Optionen, Labels, Recent Items — nicht aus dem Gedächtnis abrufen lassen.

**Typische Verstöße:** Icon-only ohne Label; Filter-State nicht sichtbar; mehrstufige Codes merken müssen.

## 7. Flexibility and Efficiency of Use
Accelerators für Experten (Shortcuts, Bulk-Actions, Defaults), ohne Novizen zu überfordern.

## 8. Aesthetic and Minimalist Design
Jede Extra-Info konkurriert mit der relevanten. Ein Job pro View/Section.

**Typische Verstöße:** Dashboard-Hero voller Stats; mehrere Primary-CTAs.

## 9. Help Users Recognize, Diagnose, and Recover from Errors
Fehler in Klartext, Ursache andeuten, konkreten Recovery-Schritt nennen. Keine Error-Codes allein.

## 10. Help and Documentation
Hilfe kontextuell und kurz. Lieber UI selbsterklärend machen.

---

## Heuristik-Evaluation — Praxis

- Ideal: 3–5 unabhängige Evaluatoren (auch solo-Agent: mehrere Passes mit frischem Fokus).
- Scope eng halten (ein Flow).
- Pass 1: Flow verstehen. Pass 2: Heuristiken anwenden.
- Heuristiken sind Guidelines, keine Gesetze — Ausnahme nur mit Begründung/Research.
