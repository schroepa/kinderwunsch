import { useEffect, useMemo, useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip, type MapRef } from './ui/map';
import type { Clinic, TreatmentType } from '../lib/types';
import { TREATMENT_INFO } from '../lib/treatments';

const EUROPE_CENTER: [number, number] = [10, 50];
const EUROPE_ZOOM = 3.5;
const SINGLE_MARKER_ZOOM = 10;

type ClinicWithCoords = Clinic & { lat: number; lng: number };

function hasCoords(c: Clinic): c is ClinicWithCoords {
  return c.lat != null && c.lng != null;
}

function specialtyLabel(code: string): string {
  return TREATMENT_INFO[code as TreatmentType]?.shortLabel ?? code;
}

export function ClinicsMap({ clinics }: { clinics: Clinic[] }) {
  // maplibre-gl touches the DOM/window at instantiation time; only build the
  // map after this component has mounted on the client (also guards against
  // hydration mismatches when this is ever rendered during an SSR pass).
  const [mounted, setMounted] = useState(false);
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const withCoords = useMemo(() => clinics.filter(hasCoords), [clinics]);
  const missing = clinics.length - withCoords.length;

  const center: [number, number] =
    withCoords.length === 1 ? [withCoords[0].lng, withCoords[0].lat] : EUROPE_CENTER;
  const zoom = withCoords.length === 1 ? SINGLE_MARKER_ZOOM : EUROPE_ZOOM;

  useEffect(() => {
    if (!mapInstance || withCoords.length === 0) return;

    if (withCoords.length === 1) {
      const only = withCoords[0];
      const fly = () =>
        mapInstance.flyTo({ center: [only.lng, only.lat], zoom: SINGLE_MARKER_ZOOM, duration: 0 });
      if (mapInstance.loaded()) {
        fly();
      } else {
        mapInstance.once('load', fly);
      }
      return;
    }

    const lons = withCoords.map((c) => c.lng);
    const lats = withCoords.map((c) => c.lat);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ];
    const fit = () => mapInstance.fitBounds(bounds, { padding: 48, maxZoom: 9, duration: 0 });
    if (mapInstance.loaded()) {
      fit();
    } else {
      mapInstance.once('load', fit);
    }
  }, [mapInstance, withCoords]);

  return (
    <div className="space-y-3">
      <p className="text-fluid-xs text-muted-foreground">
        Ungefähre Lage (Stadtzentrum).
        {missing > 0
          ? ` ${missing} ${missing === 1 ? 'Klinik ohne Kartenposition' : 'Kliniken ohne Kartenposition'}.`
          : null}
      </p>
      <div className="h-[min(70vh,520px)] min-h-[420px] w-full overflow-hidden rounded-xl border border-border/60">
        {mounted ? (
          <Map ref={setMapInstance} center={center} zoom={zoom}>
            {withCoords.map((c) => (
              <MapMarker key={c.id} longitude={c.lng} latitude={c.lat}>
                <MarkerContent>
                  <div className="size-3.5 rounded-full border-2 border-background bg-primary shadow-sm" />
                </MarkerContent>
                <MarkerTooltip>{c.name}</MarkerTooltip>
                <MarkerPopup>
                  <div className="space-y-1 p-1">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-fluid-xs text-muted-foreground">
                      {c.city} · {c.countryCode}
                    </p>
                    {c.specialties.length > 0 && (
                      <p className="text-fluid-xs text-muted-foreground">
                        {c.specialties.slice(0, 3).map(specialtyLabel).join(' · ')}
                      </p>
                    )}
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-fluid-xs font-medium text-primary hover:underline"
                    >
                      Website besuchen
                    </a>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}
          </Map>
        ) : (
          <div className="flex h-full items-center justify-center text-fluid-xs text-muted-foreground">
            Karte wird geladen…
          </div>
        )}
      </div>
    </div>
  );
}
