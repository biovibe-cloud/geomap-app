"use client";

import Link from "next/link";
import { useState } from "react";
import { Lightbox } from "@/components/map/Lightbox";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { PinSolid, Spinner, Globe } from "@/components/ui/Icons";
import type { LoadState, Marker } from "@/lib/types";

export interface PublicMapViewProps {
  status: LoadState;
  markers: Marker[];
  /** Token invalid / revoked → show the unavailable message. */
  unavailable: boolean;
}

/**
 * Standalone, full-screen embed map — no sidebar, header or auth.
 * Same markers / hover-popup / lightbox as the authenticated view, plus a
 * minimal "GeoMap" badge bottom-right. Driven by useLeafletMap (dynamic
 * import) exactly like the private map, so it never imports leaflet directly.
 */
export function PublicMapView({ status, markers, unavailable }: PublicMapViewProps) {
  const [active, setActive] = useState<Marker | null>(null);

  useLeafletMap(markers, {
    enabled: status === "ready",
    onMarkerClick: (m) => setActive(m),
  });

  return (
    <div className="relative h-dvh w-full bg-bg">
      {/* Leaflet mounts here */}
      <div id="map-container" className="h-full w-full" />

      {status === "loading" && (
        <div className="absolute inset-0 z-[400] grid place-items-center bg-surface/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-ink-muted">
            <Spinner size={26} />
            <span className="text-[13.5px] font-medium">Cargando mapa…</span>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-[400] grid place-items-center bg-bg p-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-3 text-ink-muted">
              <Globe size={26} />
            </div>
            <h1 className="mt-4 text-lg font-semibold tracking-[-0.01em]">
              {unavailable ? "Este mapa no está disponible" : "No se pudo cargar el mapa"}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
              {unavailable
                ? "El enlace puede haber expirado o el acceso fue revocado por su propietario."
                : "Ocurrió un error al cargar el mapa. Vuelve a intentarlo más tarde."}
            </p>
          </div>
        </div>
      )}

      {status === "ready" && markers.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[400] grid place-items-center">
          <span className="rounded-full bg-surface/90 px-4 py-2 text-[13px] font-medium text-ink-muted shadow-card">
            Este mapa todavía no tiene fotos ubicadas.
          </span>
        </div>
      )}

      {/* minimal branding */}
      <Link href="/"
        className="absolute bottom-3 right-3 z-[500] inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow-card backdrop-blur-sm transition-colors hover:bg-surface"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-primary text-white">
          <PinSolid size={11} />
        </span>
        Geo<span className="-ml-1 text-primary">Map</span>
      </Link>

      <Lightbox marker={active} onClose={() => setActive(null)} />
    </div>
  );
}
