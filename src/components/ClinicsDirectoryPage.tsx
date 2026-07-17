import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Globe, Loader2, Search } from 'lucide-react';
import type { Clinic } from '../lib/types';
import { loadClinics } from '../lib/loadClinics';
import { ClinicCard } from './ClinicCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Deutschland',
  CZ: 'Tschechien',
  PL: 'Polen',
  ES: 'Spanien',
  GR: 'Griechenland',
  AT: 'Österreich',
  DK: 'Dänemark',
  NL: 'Niederlande',
  PT: 'Portugal',
  IT: 'Italien',
  FR: 'Frankreich',
};

export default function ClinicsDirectoryPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [standLabel, setStandLabel] = useState('…');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('country');
    if (param && /^[A-Za-z]{2}$/.test(param)) {
      setCountry(param.toUpperCase());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await loadClinics({ force: true });
      if (cancelled) return;
      setClinics(data.clinics);
      const stamp = data.meta.lastCrawledAt ?? data.meta.lastPartialAt;
      setStandLabel(stamp ? new Date(stamp).toLocaleDateString('de-DE') : 'Build-Daten');
      setRefreshing(data.meta.refreshing);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const countries = useMemo(
    () => Array.from(new Set(clinics.map((c) => c.countryCode))).sort(),
    [clinics],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return clinics.filter((c) => {
      if (country !== 'all' && c.countryCode !== country) return false;
      if (!query) return true;
      return `${c.name} ${c.city} ${c.countryCode}`.toLowerCase().includes(query);
    });
  }, [clinics, country, q]);

  return (
    <div className="app-atmosphere min-h-dvh">
      <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
        <header className="mb-8 max-w-3xl animate-fade-up sm:mb-10">
          <div className="-ml-2 mb-4 flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="min-h-10">
              <a href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Zurück zum Finder
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="min-h-10">
              <a href="/wissen">Wissen: Guides zu Behandlungen & Ländern</a>
            </Button>
          </div>
          <p className="label-geist mb-3 text-primary">EU-Übersicht</p>
          <h1 className="text-fluid-3xl font-semibold tracking-tight text-foreground sm:text-fluid-display">
            Kliniken in Europa
          </h1>
          <p className="measure mt-4 text-fluid-lg leading-relaxed text-muted-foreground">
            Durchsuchen Sie die Klinikdatenbank nach Name, Stadt oder Land. Angaben ohne Gewähr —
            bitte vor Ort und mit der Klinik bestätigen.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-fluid-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-primary" aria-hidden />
              Stand:{' '}
              <span className="data-geist text-foreground">{standLabel}</span>
            </span>
            <span aria-hidden>·</span>
            <span>
              <span className="data-geist text-foreground">{filtered.length}</span>
              {filtered.length === 1 ? ' Treffer' : ' Treffer'}
              {!loading && clinics.length > 0 && filtered.length !== clinics.length && (
                <span className="text-muted-foreground"> von {clinics.length}</span>
              )}
            </span>
            {refreshing && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Aktualisierung…
              </span>
            )}
          </p>
        </header>

        <div
          className="animate-fade-up sticky top-0 z-20 mb-6 border-b border-border/60 bg-background/85 py-4 backdrop-blur-md lg:rounded-2xl lg:border lg:px-5"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="clinic-search" className="sr-only">
                Klinik oder Stadt suchen
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="clinic-search"
                className="min-h-11 pl-10"
                placeholder="Name oder Stadt…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="w-full sm:w-52">
              <label htmlFor="clinic-country" className="sr-only">
                Nach Land filtern
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="clinic-country" className="min-h-11 w-full">
                  <SelectValue placeholder="Land" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Länder</SelectItem>
                  {countries.map((code) => (
                    <SelectItem key={code} value={code}>
                      {COUNTRY_NAMES[code] ?? code} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '100ms' }} aria-live="polite">
          {loading ? (
            <p className="flex items-center gap-2 py-16 text-fluid-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
              Kliniken werden geladen…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-fluid-sm text-muted-foreground">
              Keine Kliniken gefunden. Passen Sie Filter oder Suchbegriff an.
            </p>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {filtered.map((c) => (
                <li key={c.id}>
                  <ClinicCard clinic={c} standLabel={standLabel} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="mt-16 sm:mt-20">
          <div className="divider-soft mb-6" />
          <p className="text-fluid-sm text-muted-foreground">
            Medizinischer Hinweis: Diese Liste ersetzt keine Beratung. Rechtliche und medizinische
            Eignung immer mit Fachärzten und der jeweiligen Klinik klären.
          </p>
        </footer>
      </div>
    </div>
  );
}
