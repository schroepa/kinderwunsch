import { useState } from 'react';
import type { UserData, RelationshipStatus, TreatmentType } from '../lib/types';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface UserInputFormProps {
  onSubmit: (data: UserData) => void;
}

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
      treatments
    });
  };

  const toggleTreatment = (treatment: TreatmentType) => {
    setTreatments(prev => 
      prev.includes(treatment) 
        ? prev.filter(t => t !== treatment)
        : [...prev, treatment]
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Ihre persönlichen Daten</CardTitle>
        <CardDescription>
          Geben Sie Ihre Informationen ein, um passende Länder und Kliniken zu finden
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alter der Frau */}
            <div className="space-y-3">
              <Label htmlFor="female-age" className="text-base">
                Alter der Frau: <span className="font-bold text-primary">{femaleAge} Jahre</span>
              </Label>
              <Slider
                id="female-age"
                min={20}
                max={55}
                step={1}
                value={[femaleAge]}
                onValueChange={(value) => setFemaleAge(value[0])}
                className="w-full"
              />
            </div>

            {/* Alter des Mannes */}
            <div className="space-y-3">
              <Label htmlFor="male-age" className="text-base">
                Alter des Mannes: <span className="font-bold text-primary">{maleAge} Jahre</span>
              </Label>
              <Slider
                id="male-age"
                min={20}
                max={65}
                step={1}
                value={[maleAge]}
                onValueChange={(value) => setMaleAge(value[0])}
                className="w-full"
              />
            </div>
          </div>

          {/* Beziehungsstatus */}
          <div className="space-y-3">
            <Label htmlFor="relationship" className="text-base">Beziehungsstatus</Label>
            <Select value={relationshipStatus} onValueChange={(value) => setRelationshipStatus(value as RelationshipStatus)}>
              <SelectTrigger id="relationship" className="w-full">
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

          {/* Wohnort */}
          <div className="space-y-3">
            <Label htmlFor="location" className="text-base">Wohnort (für Entfernungsberechnung)</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="w-full">
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

          {/* Budget */}
          <div className="space-y-3">
            <Label htmlFor="budget" className="text-base">
              Budget: <span className="font-bold text-primary">{budget.toLocaleString('de-DE')} €</span>
            </Label>
            <Slider
              id="budget"
              min={1000}
              max={15000}
              step={500}
              value={[budget]}
              onValueChange={(value) => setBudget(value[0])}
              className="w-full"
            />
          </div>

          {/* Behandlungen */}
          <div className="space-y-3">
            <Label className="text-base">Gewünschte Behandlungen</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={treatments.includes('ivf')}
                  onChange={() => toggleTreatment('ivf')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">IVF (Standard)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={treatments.includes('icsi')}
                  onChange={() => toggleTreatment('icsi')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">ICSI (Intrazytoplasmatische Spermieninjektion)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={treatments.includes('egg-donation')}
                  onChange={() => toggleTreatment('egg-donation')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Eizellspende</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={treatments.includes('sperm-donation')}
                  onChange={() => toggleTreatment('sperm-donation')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Samenspende</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={treatments.includes('pgd')}
                  onChange={() => toggleTreatment('pgd')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">PID (Präimplantationsdiagnostik)</span>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Empfehlungen anzeigen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
