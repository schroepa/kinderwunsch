---
name: seo-geo
description: >-
  Prüft und verbessert SEO sowie Generative Engine Optimization (GEO/AEO):
  technische Indexierbarkeit, On-Page, E-E-A-T, Schema, answer-first Content und
  AI-Citation-Tauglichkeit. Immer nutzen bei SEO, GEO, AEO, Meta-Tags, Sitemap,
  Structured Data, Google AI Overviews, ChatGPT/Perplexity-Sichtbarkeit,
  Content-Briefings oder wenn Seiten „gefunden“ bzw. „zitiert“ werden sollen.
---

# SEO & GEO

## Prinzip

**SEO ist die Basis. GEO baut darauf auf.** Google betont: AI Overviews/AI Mode nutzen dieselben Qualitäts- und Index-Systeme — keine Magic-Hacks, kein Ersatz für people-first Content.

## Workflow

1. **Ziel klären** — Organische Rankings, AI-Citations, Local, oder beides?
2. **Technische Basis** — Crawlbar? Indexierbar? Canonicals? Performance?
3. **On-Page & Intent** — Query-Intent, Title/H1, Antwort zuerst, klare Hierarchie.
4. **E-E-A-T & Vertrauen** — Erfahrung, Expertise, Autorität, Trust-Signale.
5. **GEO-Layer** — Extractable Passagen, Fakten mit Quellen, Schema (nur wenn sichtbar).
6. **Messung** — Search Console + AI-Citation-Stichproben; keine Fake-Metriken.

## SEO-Checkliste (Fundament)

- [ ] HTTPS, Mobile-tauglich, sinnvolle Core Web Vitals
- [ ] `robots.txt` blockiert nicht wichtige Pfade; CDN erlaubt Crawler
- [ ] Seiten indexierbar (kein `noindex` aus Versehen); Canonical korrekt
- [ ] Ein klarer Title + Unique Meta-Description pro URL
- [ ] Eine H1; H2/H3 spiegeln echte Nutzerfragen
- [ ] Wichtiger Content als Text (nicht nur JS-only, wo Crawler scheitern)
- [ ] Interne Links zu wichtigen Seiten; sinnvolle URL-Struktur
- [ ] Bilder: Alt-Text, sinnvolle Dateinamen, komprimiert
- [ ] Structured Data nur wenn Inhalt auf der Seite sichtbar ist
- [ ] Sitemap aktuell und in Search Console eingereicht

## GEO / AI-Sichtbarkeit

Ziel: Inhalt so strukturieren, dass generative Systeme Passagen **extrahieren, verifizieren und zitieren** können.

### Content-Form

- **Answer-first:** Direkte Antwort in den ersten ~40–60 Wörtern einer Section
- **Eine Idee pro Absatz;** scannbar (Listen, Tabellen, Definitionen)
- **Fragen als Überschriften** wo Intent question-förmig ist
- **Belege:** Zahlen, Daten, Primärquellen nahe an Claims
- **Frisch halten:** sichtbares Update-Datum bei zeitkritischen Themen
- **Entity-Klarheit:** wer/was/wo eindeutig (Organisation, Produkt, Ort)

### Was Google explizit relativiert

Keine Pflicht für: spezielle AI-only Markup-Dateien, künstliches Content-Chunking, unauthentische „Mentions“. Fundament + hilfreicher Content bleiben entscheidend.

### Multi-Engine (Praxis-Hinweis)

| Fläche | Schwerpunkt |
|--------|-------------|
| Google AI Overviews | Starke klassische SEO + klare Passagen |
| ChatGPT Search / Perplexity | Entity-Klarheit, zitierfähige Fakten, scannbare Struktur |

## Ausgabeformat

```markdown
# SEO/GEO Review: [URL oder Seite]

## Ziel & Intent
…

## Technische Findings
- [Schwere] …

## On-Page / Content
- …

## GEO / Citation-Tauglichkeit
- …

## Schema-Empfehlungen
- (nur passende Typen, sichtbar abgesichert)

## Priorisierte Maßnahmen
1. …
```

## Content-Brief Template

Siehe [references/checklisten.md](references/checklisten.md).

## Quellen

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: AI Features & Your Website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- GEO-Forschung/Praxis: Princeton GEO-Paper; Branchenguides (Backlinko u. a.) — immer gegen Google-Guidance spiegeln
