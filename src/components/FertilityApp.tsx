import { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { loadClinics, shouldPrefetchOnMount } from '../lib/loadClinics';
import type { UserData } from '../lib/types';
import { AnimatedDrawIcon, AnimatedPulseIcon } from './icons/AnimatedIcon';
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
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <ThemeToggle />
      <div className="container mx-auto max-w-6xl">
        <header className="mb-10 sm:mb-14 text-center animate-fade-up">
          <p className="label-geist mb-4 inline-flex items-center justify-center gap-2">
            <AnimatedPulseIcon icon={Sparkles} size={12} className="text-primary" />
            IVF & ICSI in Europa
          </p>
          <h1 className="text-fluid-display font-semibold text-foreground">
            Kinderwunsch-Finder
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-fluid-lg text-muted-foreground leading-relaxed">
            Finden Sie die passende Behandlung und Klinik — individuell auf Ihre Situation zugeschnitten.
          </p>
        </header>

        {!showResults ? (
          <div className="mx-auto max-w-3xl animate-fade-up" style={{ animationDelay: '80ms' }}>
            <UserInputForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="mb-6 sm:mb-8">
              <Button variant="ghost" size="sm" onClick={handleReset} className="-ml-2">
                <AnimatedDrawIcon icon={ArrowLeft} size={18} />
                Zurück zur Eingabe
              </Button>
            </div>
            {userData && <ResultsDashboard userData={userData} />}
          </div>
        )}

        <footer className="mt-16 sm:mt-20">
          <div className="divider-soft mb-6" />
          <div className="space-y-2 text-center text-fluid-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground/80">Hinweis:</span> Diese Empfehlungen basieren
              auf allgemeinen Informationen und ersetzen keine individuelle medizinische Beratung.
            </p>
            <p>
              Bitte konsultieren Sie einen Facharzt und informieren Sie sich über die aktuellen rechtlichen
              Bestimmungen in den jeweiligen Ländern.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
