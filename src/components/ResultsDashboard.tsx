import { useState, useEffect } from 'react';
import type { UserData, CountryRecommendation, Clinic } from '../lib/types';
import { getCountryRecommendations } from '../lib/countryLogic';
import { loadClinics } from '../lib/loadClinics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ClinicCard } from './ClinicCard';
import { EuClinicBrowser } from './EuClinicBrowser';

interface ResultsDashboardProps {
  userData: UserData;
}

export default function ResultsDashboard({ userData }: ResultsDashboardProps) {
  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [standLabel, setStandLabel] = useState('Build-Daten');
  const [metaRefreshing, setMetaRefreshing] = useState(false);

  async function refreshClinics(force: boolean) {
    const data = await loadClinics({ force });
    setClinics(data.clinics);
    const stamp = data.meta.lastCrawledAt ?? data.meta.lastPartialAt;
    setStandLabel(stamp ? new Date(stamp).toLocaleDateString('de-DE') : 'Build-Daten');
    setMetaRefreshing(data.meta.refreshing);
  }

  useEffect(() => {
    const recs = getCountryRecommendations(userData);
    setRecommendations(recs);
    void refreshClinics(false);
  }, [userData]);

  const getFilteredClinics = (countryId: string) => {
    return clinics.filter(clinic => clinic.country === countryId);
  };

  const budgetExceeded = recommendations.some(rec => rec.costEstimate > userData.budget);

  return (
    <div className="space-y-6">
      {/* Budget Warning */}
      {budgetExceeded && (
        <Alert variant="destructive">
          <AlertTitle>⚠️ Budget-Warnung</AlertTitle>
          <AlertDescription>
            Einige der empfohlenen Optionen überschreiten Ihr Budget von {userData.budget.toLocaleString('de-DE')} €.
            Bitte überprüfen Sie die Kostenaufstellungen sorgfältig.
          </AlertDescription>
        </Alert>
      )}

      {/* Recommendations Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Ihre Top-Empfehlungen</CardTitle>
          <CardDescription>
            Basierend auf Ihren Angaben haben wir die {recommendations.length} besten Länder für Sie ermittelt
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Country Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((country, index) => (
          <Card 
            key={country.id} 
            className={`transition-all ${selectedCountry === country.id ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-4xl">{country.flagEmoji}</span>
                    <span>#{index + 1} {country.name}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Entfernung: {country.distanceFromBerlin === 0 ? 'Vor Ort' : `ca. ${country.distanceFromBerlin} km`}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Geschätzte Kosten</div>
                  <div className={`text-2xl font-bold ${country.costEstimate > userData.budget ? 'text-destructive' : 'text-primary'}`}>
                    {country.costEstimate.toLocaleString('de-DE')} €
                  </div>
                  {country.costEstimate > userData.budget && (
                    <div className="text-xs text-destructive mt-1">
                      +{(country.costEstimate - userData.budget).toLocaleString('de-DE')} € über Budget
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legal Status Badge */}
              {country.legalStatus === 'restricted' && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm">
                  ⚠️ Eingeschränkt verfügbar für Ihre Konstellation
                </div>
              )}

              {/* Pros */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <span className="text-lg">✓</span> Vorteile
                </h4>
                <ul className="space-y-1 text-sm">
                  {country.dynamicPros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              {country.dynamicCons.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">✗</span> Nachteile
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {country.dynamicCons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinics Button */}
              <button
                onClick={() => {
                  const next = selectedCountry === country.id ? null : country.id;
                  setSelectedCountry(next);
                  if (next) void refreshClinics(true);
                }}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                {selectedCountry === country.id ? 'Kliniken ausblenden' : 'Kliniken anzeigen'}
              </button>

              {/* Clinics List */}
              {selectedCountry === country.id && (
                <div className="mt-4 space-y-3 pt-4 border-t">
                  <h4 className="font-semibold text-base">Top-Kliniken in {country.name}</h4>
                  {getFilteredClinics(country.id).map(clinic => (
                    <ClinicCard key={clinic.id} clinic={clinic} standLabel={standLabel} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Alert>
          <AlertTitle>Keine passenden Optionen gefunden</AlertTitle>
          <AlertDescription>
            Leider gibt es mit Ihren aktuellen Kriterien keine geeigneten Länder. 
            Bitte passen Sie Ihre Angaben an oder kontaktieren Sie uns für eine persönliche Beratung.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        Angaben ohne Gewähr; bitte bei der Klinik bestätigen.
        {metaRefreshing ? ' · Aktualisierung läuft…' : ''}
      </p>
      <button
        type="button"
        className="px-4 py-2 border rounded-md text-sm font-medium"
        onClick={() => {
          setBrowseOpen(true);
          void refreshClinics(true);
        }}
      >
        Alle EU-Kliniken durchsuchen
      </button>
      <EuClinicBrowser
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        clinics={clinics}
        standLabel={standLabel}
      />
    </div>
  );
}
