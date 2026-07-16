import { useEffect, useState } from 'react';
import { loadClinics, shouldPrefetchOnMount } from '../lib/loadClinics';
import type { UserData } from '../lib/types';
import UserInputForm from './UserInputForm';
import ResultsDashboard from './ResultsDashboard';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kinderwunsch-Finder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Finden Sie die beste Lösung für Ihre Kinderwunschbehandlung in Europa – 
            individuell auf Ihre Situation zugeschnitten
          </p>
        </header>

        {/* Main Content */}
        {!showResults ? (
          <div className="max-w-3xl mx-auto">
            <UserInputForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <span className="text-xl">←</span>
                Zurück zur Eingabe
              </button>
            </div>

            {/* Results */}
            {userData && <ResultsDashboard userData={userData} />}
          </>
        )}

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              <strong>Hinweis:</strong> Diese Empfehlungen basieren auf allgemeinen Informationen und 
              ersetzen keine individuelle medizinische Beratung.
            </p>
            <p>
              Bitte konsultieren Sie einen Facharzt und informieren Sie sich über die aktuellen 
              rechtlichen Bestimmungen in den jeweiligen Ländern.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
