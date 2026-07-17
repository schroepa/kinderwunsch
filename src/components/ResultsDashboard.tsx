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
import { filterAndSortClinics } from '../lib/clinicRanking';
import { loadClinics } from '../lib/loadClinics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { ClinicCard } from './ClinicCard';
import { AnimatedIcon } from './icons/AnimatedIcon';
import { cn } from '@/lib/utils';

const TOP_N = 3;
const CLINICS_PREVIEW = 3;

interface ResultsDashboardProps {
  userData: UserData;
}

interface CountryCardProps {
  country: CountryRecommendation;
  rank: number;
  userData: UserData;
  isSelected: boolean;
  onToggleSelect: () => void;
  clinics: Clinic[];
  standLabel: string;
  showAllClinics: boolean;
  onToggleShowAllClinics: () => void;
}

function CountryCard({
  country,
  rank,
  userData,
  isSelected,
  onToggleSelect,
  clinics,
  standLabel,
  showAllClinics,
  onToggleShowAllClinics,
}: CountryCardProps) {
  const { clinics: ranked, usedTreatmentFallback } = filterAndSortClinics(
    clinics,
    country.id,
    userData.treatments,
  );
  const visible = showAllClinics ? ranked : ranked.slice(0, CLINICS_PREVIEW);
  const hiddenClinicCount = ranked.length - visible.length;

  return (
    <Card className={cn('transition-geist', isSelected && 'surface-selected')}>
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="data-geist flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary text-fluid-xs font-medium text-foreground">
              {countryIso(country.id)}
            </span>
            <div>
              <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="data-geist text-fluid-xs text-muted-foreground">#{rank}</span>
                <span>{country.name}</span>
              </CardTitle>
              <CardDescription className="mt-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {country.distanceFromBerlin === 0 ? (
                  'Vor Ort'
                ) : (
                  <>
                    ca. <span className="data-geist">{country.distanceFromBerlin}</span> km
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
          <div className="surface-warning flex items-start gap-2.5 rounded-lg px-4 py-3 text-fluid-sm">
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

        <Button variant={isSelected ? 'secondary' : 'default'} onClick={onToggleSelect}>
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
            {usedTreatmentFallback && ranked.length > 0 && (
              <p className="text-fluid-xs text-muted-foreground">
                Keine Klinik mit exakt passender Spezialisierung — alle Kliniken in diesem Land:
              </p>
            )}
            {ranked.length === 0 ? (
              <p className="text-fluid-sm text-muted-foreground">
                Keine Kliniken für dieses Land verfügbar.
              </p>
            ) : (
              <>
                {visible.map((clinic) => (
                  <ClinicCard key={clinic.id} clinic={clinic} standLabel={standLabel} />
                ))}
                {hiddenClinicCount > 0 && (
                  <Button variant="secondary" size="sm" onClick={onToggleShowAllClinics}>
                    Weitere Kliniken ({hiddenClinicCount})
                    <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                  </Button>
                )}
                {showAllClinics && ranked.length > CLINICS_PREVIEW && (
                  <Button variant="secondary" size="sm" onClick={onToggleShowAllClinics}>
                    Weniger anzeigen
                    <ChevronUp className="h-4 w-4 opacity-70" aria-hidden />
                  </Button>
                )}
              </>
            )}
            <a
              href={`/kliniken?country=${countryIso(country.id)}`}
              className="inline-flex items-center gap-1.5 pt-1 text-fluid-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              Kliniken in {country.name} im Verzeichnis
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResultsDashboard({ userData }: ResultsDashboardProps) {
  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [standLabel, setStandLabel] = useState('Build-Daten');
  const [metaRefreshing, setMetaRefreshing] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);
  const [showAllClinicsByCountry, setShowAllClinicsByCountry] = useState<Record<string, boolean>>(
    {},
  );

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

  const budgetExceeded = recommendations.some((rec) => rec.costEstimate > userData.budget);
  const primary = recommendations.slice(0, TOP_N);
  const more = recommendations.slice(TOP_N);

  const toggleCountry = (countryId: string) => {
    setSelectedCountry((current) => {
      const next = current === countryId ? null : countryId;
      if (next) void refreshClinics(true);
      return next;
    });
  };

  const toggleShowAllClinics = (countryId: string) => {
    setShowAllClinicsByCountry((current) => ({
      ...current,
      [countryId]: !current[countryId],
    }));
  };

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

      <div className="mb-2">
        <p className="form-section-title mb-2 text-muted-foreground">Ländervergleich</p>
        <p className="measure text-fluid-base text-muted-foreground">
          Top-Empfehlungen für Ihre Angaben — weitere Alternativen darunter.
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        {primary.map((country, index) => (
          <CountryCard
            key={country.id}
            country={country}
            rank={index + 1}
            userData={userData}
            isSelected={selectedCountry === country.id}
            onToggleSelect={() => toggleCountry(country.id)}
            clinics={clinics}
            standLabel={standLabel}
            showAllClinics={!!showAllClinicsByCountry[country.id]}
            onToggleShowAllClinics={() => toggleShowAllClinics(country.id)}
          />
        ))}
      </div>

      {more.length > 0 && (
        <div className="space-y-5 sm:space-y-6">
          <Button variant="secondary" onClick={() => setShowMoreCountries((v) => !v)}>
            {showMoreCountries ? 'Weniger anzeigen' : `Weitere Alternativen (${more.length})`}
            {showMoreCountries ? (
              <ChevronUp className="h-4 w-4 opacity-70" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            )}
          </Button>

          {showMoreCountries && (
            <div className="flex flex-col gap-5 sm:gap-6 animate-fade-in">
              {more.map((country, index) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  rank={TOP_N + index + 1}
                  userData={userData}
                  isSelected={selectedCountry === country.id}
                  onToggleSelect={() => toggleCountry(country.id)}
                  clinics={clinics}
                  standLabel={standLabel}
                  showAllClinics={!!showAllClinicsByCountry[country.id]}
                  onToggleShowAllClinics={() => toggleShowAllClinics(country.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
        <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
          <a href="/kliniken">
            <AnimatedIcon icon={Search} size={18} />
            Alle EU-Kliniken durchsuchen
            <Globe className="h-4 w-4 opacity-60" aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  );
}
