import { useMemo, useState } from 'react';
import type { Clinic } from '../lib/types';
import { ClinicCard } from './ClinicCard';

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
    <div className="mt-8 border-t pt-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Alle EU-Kliniken durchsuchen</h3>
          <p className="text-sm text-muted-foreground">
            Stand: {standLabel} · {filtered.length} Treffer
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-primary">
          Schließen
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="border rounded-md px-3 py-2 text-sm flex-1"
          placeholder="Name oder Stadt…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="all">Alle Länder</option>
          {countries.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filtered.map((c) => (
          <ClinicCard key={c.id} clinic={c} standLabel={standLabel} />
        ))}
      </div>
    </div>
  );
}
