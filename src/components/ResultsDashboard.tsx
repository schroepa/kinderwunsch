import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import type { UserData, CountryRecommendation, Clinic } from '../lib/types';
import { getCountryRecommendations } from '../lib/countryLogic';
import { countryIso } from '../lib/countryCodes';
import { loadClinics } from '../lib/loadClinics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { ClinicCard } from './ClinicCard';
import { EuClinicBrowser } from './EuClinicBrowser';
import { AnimatedIcon } from './icons/AnimatedIcon';
import { cn } from '@/lib/utils';

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
    return clinics.filter((clinic) => clinic.country === countryId);
  };

  const budgetExceeded = recommendations.some((rec) => rec.costEstimate > userData.budget);

  return (
    <div className="space-y-6 sm:space-y-8">
      {budgetExceeded && (
        <Alert variant="destructive" className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <AlertTitle>Budget-Warnung</AlertTitle>
            <AlertDescription>
              Einige der empfohlenen Optionen überschreiten Ihr Budget von{' '}
              {userData.budget.toLocaleString('de-DE')} €. Bitte prüfen Sie die Kostenaufstellungen
              sorgfältig.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-2xl sm:text-fluid-3xl">Ihre Top-Empfehlungen</CardTitle>
          <CardDescription>
            Basierend auf Ihren Angaben haben wir die {recommendations.length} besten Länder für Sie
            ermittelt.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {recommendations.map((country, index) => {
          const isSelected = selectedCountry === country.id;
          return (
            <Card
              key={country.id}
              className={cn('transition-geist', isSelected && 'surface-selected')}
            >
              <CardHeader className="pb-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="data-geist flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary text-fluid-xs font-medium text-foreground">
                      {countryIso(country.id)}
                    </span>
                    <div>
                      <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="data-geist text-fluid-xs text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span>{country.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1.5 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {country.distanceFromBerlin === 0 ? (
                          'Vor Ort'
                        ) : (
                          <>
                            ca.{' '}
                            <span className="data-geist">{country.distanceFromBerlin}</span> km
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="label-geist">Geschätzte Kosten</div>
                    <div
                      className={cn(
                        'data-geist text-fluid-2xl font-medium',
                        country.costEstimate > userData.budget ? 'text-destructive' : 'text-foreground',
                      )}
                    >
                      {country.costEstimate.toLocaleString('de-DE')} €
                    </div>
                    {country.costEstimate > userData.budget && (
                      <div className="data-geist mt-0.5 text-fluid-xs text-destructive">
                        +{(country.costEstimate - userData.budget).toLocaleString('de-DE')} € über Budget
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {country.legalStatus === 'restricted' && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-fluid-sm text-warning-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    Eingeschränkt verfügbar für Ihre Konstellation
                  </div>
                )}

                <div>
                  <h4 className="mb-2.5 flex items-center gap-2 text-fluid-sm font-semibold text-success">
                    <Check className="h-4 w-4" aria-hidden />
                    Vorteile
                  </h4>
                  <ul className="space-y-2">
                    {country.dynamicPros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-fluid-sm text-foreground/85">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {country.dynamicCons.length > 0 && (
                  <div>
                    <h4 className="mb-2.5 flex items-center gap-2 text-fluid-sm font-semibold text-destructive">
                      <X className="h-4 w-4" aria-hidden />
                      Nachteile
                    </h4>
                    <ul className="space-y-2">
                      {country.dynamicCons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-fluid-sm text-foreground/85">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/70" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant={isSelected ? 'secondary' : 'default'}
                  className="w-full"
                  onClick={() => {
                    const next = isSelected ? null : country.id;
                    setSelectedCountry(next);
                    if (next) void refreshClinics(true);
                  }}
                >
                  <AnimatedIcon icon={Building2} size={18} />
                  {isSelected ? 'Kliniken ausblenden' : 'Kliniken anzeigen'}
                  {isSelected ? (
                    <ChevronUp className="h-4 w-4 opacity-70" aria-hidden />
                  ) : (
                    <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                  )}
                </Button>

                {isSelected && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="divider-soft" />
                    <h4 className="text-fluid-base font-semibold">Top-Kliniken in {country.name}</h4>
                    {getFilteredClinics(country.id).length === 0 ? (
                      <p className="text-fluid-sm text-muted-foreground">
                        Keine Kliniken für dieses Land verfügbar.
                      </p>
                    ) : (
                      getFilteredClinics(country.id).map((clinic) => (
                        <ClinicCard key={clinic.id} clinic={clinic} standLabel={standLabel} />
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Alert>
          <AlertTitle>Keine passenden Optionen gefunden</AlertTitle>
          <AlertDescription>
            Leider gibt es mit Ihren aktuellen Kriterien keine geeigneten Länder. Bitte passen Sie Ihre
            Angaben an.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 pt-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-fluid-xs text-muted-foreground">
          <span>Angaben ohne Gewähr; bitte bei der Klinik bestätigen.</span>
          {metaRefreshing && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Aktualisierung läuft…
            </span>
          )}
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            setBrowseOpen(true);
            void refreshClinics(true);
          }}
        >
          <AnimatedIcon icon={Search} size={18} />
          Alle EU-Kliniken durchsuchen
          <Globe className="h-4 w-4 opacity-60" aria-hidden />
        </Button>
      </div>

      <EuClinicBrowser
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        clinics={clinics}
        standLabel={standLabel}
      />
    </div>
  );
}
