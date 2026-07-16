# Kinderwunsch-Finder 👶

Eine interaktive Web-App zur Unterstützung bei der Suche nach geeigneten Kinderwunschkliniken in Europa.

## 🎯 Funktionen

- **Interaktives Eingabeformular** mit shadcn/ui Komponenten
- **Dynamische Länderempfehlungen** basierend auf individuellen Parametern
- **Intelligente Geschäftslogik** für länderspezifische Regelungen
- **Klinik-Datenbank** mit realen Beispieldaten
- **Responsive Design** für alle Geräte
- **Deutsche Benutzeroberfläche**

## 🛠 Tech-Stack

- **Framework:** Astro 4.x
- **UI-Bibliothek:** React 18
- **Styling:** Tailwind CSS
- **Komponenten:** shadcn/ui
- **TypeScript:** Strict Mode
- **Datenspeicher:** JSON-Dateien

## 📦 Installation

### Voraussetzungen

- Node.js 18+ oder 20+
- npm oder pnpm

### Setup

1. **Abhängigkeiten installieren:**

```bash
npm install
```

oder mit pnpm:

```bash
pnpm install
```

2. **Entwicklungsserver starten:**

```bash
npm run dev
```

oder:

```bash
pnpm dev
```

Die App ist nun unter `http://localhost:4321` erreichbar.

## 🚀 Deployment

### Produktions-Build erstellen:

```bash
npm run build
```

### Build-Vorschau lokal testen:

```bash
npm run preview
```

## 📁 Projektstruktur

```
/
├── public/
│   ├── data/
│   │   └── clinics.json          # Klinik-Datenbank
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui Komponenten
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── alert.tsx
│   │   │   └── button.tsx
│   │   ├── UserInputForm.tsx     # Eingabeformular
│   │   ├── ResultsDashboard.tsx  # Ergebnis-Anzeige
│   │   └── FertilityApp.tsx      # Haupt-App-Komponente
│   ├── lib/
│   │   ├── types.ts              # TypeScript-Typen
│   │   ├── countryLogic.ts       # Geschäftslogik
│   │   └── utils.ts              # Hilfsfunktionen
│   ├── pages/
│   │   └── index.astro           # Hauptseite
│   └── styles/
│       └── globals.css           # Globale Styles
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 🌍 Unterstützte Länder

Die App enthält Informationen und Regelungen für:

- 🇩🇪 **Deutschland** - Höchste Standards, Kassenunterstützung für verheiratete Paare
- 🇨🇿 **Tschechien** - Hervorragendes Preis-Leistungs-Verhältnis, Eizellspende legal
- 🇵🇱 **Polen** - Günstigste Option, sehr nah an Deutschland
- 🇪🇸 **Spanien** - Liberalste Gesetze, alle Familienmodelle
- 🇬🇷 **Griechenland** - Liberal und günstiger als Spanien

## 📊 Geschäftslogik

Die App berücksichtigt automatisch:

- **Altersanforderungen** der verschiedenen Länder
- **Beziehungsstatus** und rechtliche Zulässigkeit
- **Behandlungsarten** und ihre Verfügbarkeit
- **Budget-Einschränkungen** mit Warnungen
- **Entfernungen** von Berlin (konfigurierbar)
- **Kostenübernahme** durch Krankenkassen (Deutschland)

## 🔧 Konfiguration

### Klinik-Daten erweitern

Bearbeiten Sie `public/data/clinics.json`, um weitere Kliniken hinzuzufügen:

```json
{
  "id": "unique-id",
  "name": "Klinikname",
  "country": "germany",
  "city": "Stadt",
  "rating": 4.8,
  "website": "https://example.com",
  "specialties": ["ivf", "icsi", "egg-donation"],
  "approximateCost": {
    "ivf": 3500,
    "icsi": 4500
  }
}
```

### Länder-Logik anpassen

Die Geschäftslogik befindet sich in `src/lib/countryLogic.ts`.

## 📝 Lizenz

Dieses Projekt wurde für Bildungszwecke erstellt.

## ⚠️ Disclaimer

Diese App bietet allgemeine Informationen und ersetzt keine medizinische Beratung. 
Bitte konsultieren Sie Fachärzte und informieren Sie sich über aktuelle rechtliche Bestimmungen.
