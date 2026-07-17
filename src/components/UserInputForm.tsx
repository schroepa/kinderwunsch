import { useState } from 'react';
import { Compass } from 'lucide-react';
import type { UserData, RelationshipStatus, TreatmentType } from '../lib/types';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TreatmentToggle } from './TreatmentToggle';
import { AnimatedIcon } from './icons/AnimatedIcon';

interface UserInputFormProps {
  onSubmit: (data: UserData) => void;
}

const TREATMENTS: TreatmentType[] = ['ivf', 'icsi', 'egg-donation', 'sperm-donation', 'pgd'];

export default function UserInputForm({ onSubmit }: UserInputFormProps) {
  const [femaleAge, setFemaleAge] = useState<number>(32);
  const [maleAge, setMaleAge] = useState<number>(35);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('married');
  const [location, setLocation] = useState<string>('Berlin');
  const [budget, setBudget] = useState<number>(5000);
  const [treatments, setTreatments] = useState<TreatmentType[]>(['icsi']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    setTreatments((prev) =>
      prev.includes(treatment) ? prev.filter((t) => t !== treatment) : [...prev, treatment],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-fluid-2xl sm:text-fluid-3xl">Ihre persönlichen Daten</CardTitle>
        <CardDescription>
          Geben Sie Ihre Informationen ein, um passende Länder und Kliniken zu finden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <Label htmlFor="female-age">
                Alter der Frau{' '}
                <span className="data-geist font-medium text-foreground normal-case tracking-normal">
                  {femaleAge} Jahre
                </span>
              </Label>
              <Slider
                id="female-age"
                min={20}
                max={55}
                step={1}
                value={[femaleAge]}
                onValueChange={(value) => setFemaleAge(value[0])}
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="male-age">
                Alter des Mannes{' '}
                <span className="data-geist font-medium text-foreground normal-case tracking-normal">
                  {maleAge} Jahre
                </span>
              </Label>
              <Slider
                id="male-age"
                min={20}
                max={65}
                step={1}
                value={[maleAge]}
                onValueChange={(value) => setMaleAge(value[0])}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="relationship">Beziehungsstatus</Label>
            <Select
              value={relationshipStatus}
              onValueChange={(value) => setRelationshipStatus(value as RelationshipStatus)}
            >
              <SelectTrigger id="relationship">
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

          <div className="space-y-3">
            <Label htmlFor="location">Wohnort (für Entfernungsberechnung)</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
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
          </div>

          <div className="space-y-4">
            <Label htmlFor="budget">
              Budget{' '}
              <span className="data-geist font-medium text-foreground normal-case tracking-normal">
                {budget.toLocaleString('de-DE')} €
              </span>
            </Label>
            <Slider
              id="budget"
              min={1000}
              max={15000}
              step={500}
              value={[budget]}
              onValueChange={(value) => setBudget(value[0])}
            />
          </div>

          <div className="space-y-3">
            <Label>Gewünschte Behandlungen</Label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {TREATMENTS.map((treatment) => (
                <TreatmentToggle
                  key={treatment}
                  treatment={treatment}
                  checked={treatments.includes(treatment)}
                  onChange={() => toggleTreatment(treatment)}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <AnimatedIcon icon={Compass} size={18} />
            Empfehlungen anzeigen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
