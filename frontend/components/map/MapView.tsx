"use client";

import { useState } from "react";
import { MapSidebar } from "./MapSidebar";
import { Lightbox } from "./Lightbox";
import { MapLoading, MapNoGps, MapError } from "./MapStates";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { X } from "@/components/ui/Icons";
import type { LoadState, Marker, UnlocatedImage } from "@/lib/types";

export interface MapViewProps {
  mapName: string;
  status: LoadState;
  markers: Marker[];
  unlocated: UnlocatedImage[];
  onUploadClick: () => void;
  /** Persist a manual location for a photo. */
  onLocate: (imageId: string, lat: number, lng: number) => void;
  onRetry?: () => void;
}

/**
 * Map screen. Renders the collapsible sidebar + a full-size #map-container.
 * Leaflet is driven entirely by useLeafletMap() - this component never imports
 * "leaflet" so it stays SSR-safe (the hook does the dynamic import).
 */
export function MapView({
  mapName,
  status,
  markers,
  unlocated,
  onUploadClick,
  onLocate,
  onRetry,
}: MapViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState<Marker | null>(null);
  const [locating, setLocating] = useState<UnlocatedImage | null>(null);

  // Initialize the map only when data is ready.
  useLeafletMap(markers, {
    enabled: status === "ready",
    onMarkerClick: (m) => setActive(m),
    onMapClick: locating
      ? (lat, lng) => {
          onLocate(locating.image_id, lat, lng);
          setLocating(null);
        }
      : undefined,
  });

  const showNoGps = status === "ready" && markers.length === 0;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <MapSidebar
        mapName={mapName}
        markers={markers}
        unlocated={unlocated}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((s) => !s)}
        onUploadClick={onUploadClick}
        onLocateRequest={(img) => setLocating(img)}
      />

      <div className="relative min-w-0 flex-1">
        {/* Leaflet mounts here. The hook owns its lifecycle. */}
        <div id="map-container" className="h-full w-full" />

        {status === "loading" && <MapLoading />}
        {status === "error" && <MapError onRetry={onRetry} />}
        {showNoGps && <MapNoGps onUploadClick={onUploadClick} />}

        {/* "locate" mode banner - the user clicks the map to drop the photo */}
        {locating && (
          <div className="absolute inset-x-0 top-0 z-[600] flex items-center gap-3 bg-primary px-4 py-2.5 text-primary-fg shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={locating.thumb_url}
              alt={locating.filename}
              className="h-8 w-8 flex-none rounded-md object-cover ring-2 ring-white/40"
            />
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
              Haz clic en el mapa para ubicar <b>{locating.filename}</b>
            </span>
            <button
              type="button"
              aria-label="Cancelar"
              onClick={() => setLocating(null)}
              className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-white/15 transition-colors hover:bg-white/25"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <Lightbox marker={active} onClose={() => setActive(null)} />
    </div>
  );
}
