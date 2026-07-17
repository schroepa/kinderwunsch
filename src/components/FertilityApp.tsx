import { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { loadClinics, shouldPrefetchOnMount } from '../lib/loadClinics';
import type { UserData } from '../lib/types';
import { AnimatedDrawIcon } from './icons/AnimatedIcon';
import UserInputForm from './UserInputForm';
import ResultsDashboard from './ResultsDashboard';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

export default function FertilityApp() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (shouldPrefetchOnMount()) {
      void loadClinics({ force: false });
    }
  }, []);

  const handleFormSubmit = (data: UserData) => {
    setUserData(data);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setShowResults(false);
    setUserData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-atmosphere min-h-dvh">
      <ThemeToggle />

      <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
        {!showResults ? (
          <>
            <header className="relative mb-10 max-w-2xl pt-6 sm:mb-14 sm:pt-10 lg:mb-16">
              <div className="animate-fade-up brand-lockup">
                <p className="label-geist mb-5 text-primary">IVF · ICSI · Europa</p>
                <h1 className="brand-wordmark">
                  Kinderwunsch
                  <br />
                  <em>Finder</em>
                </h1>
                <p className="measure mt-6 text-fluid-lg leading-relaxed text-muted-foreground">
                  Passende Länder und Kliniken — basierend auf Alter, Status, Budget und gewünschter
                  Behandlung.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="min-h-11 px-6">
                    <a href="#eingabe">
                      Jetzt starten
                      <ArrowDown className="h-4 w-4 opacity-80" aria-hidden />
                    </a>
                  </Button>
                  <p className="text-fluid-xs text-muted-foreground">Kostenlos · ohne Registrierung</p>
                </div>
              </div>
            </header>

            <section
              id="eingabe"
              aria-labelledby="eingabe-heading"
              className="animate-fade-up scroll-mt-8"
              style={{ animationDelay: '100ms' }}
            >
              <UserInputForm onSubmit={handleFormSubmit} />
            </section>
          </>
        ) : (
          <div className="animate-fade-up pt-10 sm:pt-14">
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label-geist mb-2 text-primary">Ergebnisse</p>
                <h2 className="text-fluid-3xl font-semibold tracking-tight text-foreground">
                  Ihre Empfehlungen
                </h2>
                <p className="mt-2 max-w-xl text-fluid-sm text-muted-foreground">
                  Länder und Kliniken sortiert nach Ihrer Situation. Angaben ohne Gewähr — bitte mit der
                  Klinik und einem Facharzt prüfen.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleReset} className="min-h-10 self-start">
                <AnimatedDrawIcon icon={ArrowLeft} size={18} />
                Zurück zur Eingabe
              </Button>
            </div>
            <div aria-live="polite" aria-atomic="false">
              {userData && <ResultsDashboard userData={userData} />}
            </div>
          </div>
        )}

        <footer className="mt-20 sm:mt-28">
          <div className="divider-soft mb-8" />
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="space-y-2 text-fluid-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground/85">Medizinischer Hinweis:</span> Diese
                Empfehlungen basieren auf allgemeinen Informationen und ersetzen keine individuelle
                Beratung durch Fachärzte.
              </p>
              <p>
                Rechtliche Regelungen und Kosten ändern sich. Bitte aktuelle Bestimmungen und
                Klinikangaben vor Ort bestätigen.
              </p>
              <p>
                <a href="/kliniken" className="font-medium text-primary hover:underline">
                  Alle EU-Kliniken durchsuchen
                </a>
              </p>
            </div>
            <p className="data-geist text-fluid-xs text-muted-foreground sm:text-right">
              Kinderwunsch-Finder
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
