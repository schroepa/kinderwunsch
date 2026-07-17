import { useId, useState } from 'react';
import { Compass } from 'lucide-react';
import type { UserData, RelationshipStatus, TreatmentType } from '../lib/types';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TREATMENT_ORDER } from '../lib/treatments';
import { TreatmentToggle } from './TreatmentToggle';
import { AnimatedIcon } from './icons/AnimatedIcon';
import { SliderField } from './SliderField';

interface UserInputFormProps {
  onSubmit: (data: UserData) => void;
}

export default function UserInputForm({ onSubmit }: UserInputFormProps) {
  const formId = useId();
  const [femaleAge, setFemaleAge] = useState<number>(32);
  const [maleAge, setMaleAge] = useState<number>(35);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('married');
  const [location, setLocation] = useState<string>('Berlin');
  const [budget, setBudget] = useState<number>(5000);
  const [treatments, setTreatments] = useState<TreatmentType[]>(['icsi']);
  const [treatmentError, setTreatmentError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (treatments.length === 0) {
      setTreatmentError('Bitte wählen Sie mindestens eine Behandlung.');
      return;
    }
    setTreatmentError(null);
    onSubmit({
      femaleAge,
      maleAge,
      relationshipStatus,
      location,
      budget,
      treatments,
    });
  };

  const toggleTreatment = (treatment: TreatmentType) => {
    setTreatments((prev) => {
      const next = prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment];
      if (next.length > 0) setTreatmentError(null);
      return next;
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-secondary/40 pb-6">
        <p className="form-section-title mb-2 text-muted-foreground" id="eingabe-heading">
          Schritt 1 von 1 · Eingabe
        </p>
        <CardTitle className="text-fluid-2xl sm:text-fluid-3xl">Ihre Situation</CardTitle>
        <CardDescription className="measure text-fluid-base">
          Alter, Status, Wohnort und Budget steuern, welche Länder und Kliniken sinnvoll sind.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 sm:pt-8">
        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          <fieldset className="space-y-6">
            <legend className="form-section-title mb-4 text-muted-foreground">Person & Rahmen</legend>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8">
              <SliderField
                id={`${formId}-female-age`}
                label="Alter der Frau"
                value={femaleAge}
                onChange={setFemaleAge}
                min={20}
                max={55}
                step={1}
                formatValue={(v) => `${v} J.`}
                ariaValueText={`${femaleAge} Jahre`}
                minLabel="20"
                maxLabel="55"
              />

              <SliderField
                id={`${formId}-male-age`}
                label="Alter des Mannes"
                value={maleAge}
                onChange={setMaleAge}
                min={20}
                max={65}
                step={1}
                formatValue={(v) => `${v} J.`}
                ariaValueText={`${maleAge} Jahre`}
                minLabel="20"
                maxLabel="65"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <div className="space-y-2">
                <Label htmlFor={`${formId}-relationship`}>Beziehungsstatus</Label>
                <Select
                  value={relationshipStatus}
                  onValueChange={(value) => setRelationshipStatus(value as RelationshipStatus)}
                >
                  <SelectTrigger id={`${formId}-relationship`} className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="married">Verheiratet</SelectItem>
                    <SelectItem value="unmarried">Unverheiratet (Paar)</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="same-sex">Gleichgeschlechtliches Paar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${formId}-location`}>Wohnort</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id={`${formId}-location`} className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berlin">Berlin</SelectItem>
                    <SelectItem value="Hamburg">Hamburg</SelectItem>
                    <SelectItem value="München">München</SelectItem>
                    <SelectItem value="Köln">Köln</SelectItem>
                    <SelectItem value="Frankfurt">Frankfurt</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-fluid-xs text-muted-foreground">Für ungefähre Entfernungen</p>
              </div>
            </div>

            <SliderField
              id={`${formId}-budget`}
              label="Budget"
              value={budget}
              onChange={setBudget}
              min={1000}
              max={15000}
              step={500}
              formatValue={(v) => `${v.toLocaleString('de-DE')} €`}
              ariaValueText={`${budget.toLocaleString('de-DE')} Euro`}
              minLabel="1.000 €"
              maxLabel="15.000 €"
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="form-section-title mb-1 text-muted-foreground">Behandlungen</legend>
            <p id={`${formId}-treatments-hint`} className="mb-3 text-fluid-sm text-muted-foreground">
              Mehrfachauswahl möglich. Kurze Erklärungen stehen unter jedem Begriff. Mindestens eine
              Option wählen.
            </p>
            <div
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              role="group"
              aria-describedby={
                treatmentError
                  ? `${formId}-treatments-hint ${formId}-treatments-error`
                  : `${formId}-treatments-hint`
              }
            >
              {TREATMENT_ORDER.map((treatment) => (
                <TreatmentToggle
                  key={treatment}
                  treatment={treatment}
                  checked={treatments.includes(treatment)}
                  onChange={() => toggleTreatment(treatment)}
                />
              ))}
            </div>
            {treatmentError && (
              <p
                id={`${formId}-treatments-error`}
                role="alert"
                className="text-fluid-sm text-destructive"
              >
                {treatmentError}
              </p>
            )}
          </fieldset>

          <Button type="submit" className="min-h-12 w-full" size="lg">
            <AnimatedIcon icon={Compass} size={18} />
            Empfehlungen anzeigen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
