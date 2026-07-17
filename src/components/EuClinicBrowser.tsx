import { useMemo, useState } from 'react';
import { Globe, Search, X } from 'lucide-react';
import type { Clinic } from '../lib/types';
import { ClinicCard } from './ClinicCard';
import { AnimatedIcon } from './icons/AnimatedIcon';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function EuClinicBrowser({
  clinics,
  standLabel,
  open,
  onClose,
}: {
  clinics: Clinic[];
  standLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const countries = useMemo(
    () => Array.from(new Set(clinics.map((c) => c.countryCode))).sort(),
    [clinics],
  );
  const filtered = clinics.filter((c) => {
    if (country !== 'all' && c.countryCode !== country) return false;
    return `${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase());
  });

  if (!open) return null;

  return (
    <div className="surface-card mt-8 space-y-5 p-5 sm:p-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-fluid-xl font-semibold">
            <AnimatedIcon icon={Globe} size={22} className="text-primary" />
            Alle EU-Kliniken durchsuchen
          </h3>
          <p className="label-geist mt-1 normal-case">
            Stand: <span className="data-geist normal-case tracking-normal">{standLabel}</span> ·{' '}
            <span className="data-geist normal-case tracking-normal">{filtered.length}</span> Treffer
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Schließen">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-10"
            placeholder="Name oder Stadt…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Land" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Länder</SelectItem>
            {countries.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid max-h-[min(24rem,60vh)] gap-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-fluid-sm text-muted-foreground">
            Keine Kliniken gefunden. Passen Sie Filter oder Suchbegriff an.
          </p>
        ) : (
          filtered.map((c) => <ClinicCard key={c.id} clinic={c} standLabel={standLabel} />)
        )}
      </div>
    </div>
  );
}
