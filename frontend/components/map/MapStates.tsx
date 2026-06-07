"use client";

import { Spinner, Photo, AlertTriangle, Upload } from "@/components/ui/Icons";

/** Overlay shown over the map container while tiles/markers load. */
export function MapLoading() {
  return (
    <div className="absolute inset-0 z-[400] grid place-items-center bg-surface/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-ink-muted">
        <Spinner size={26} />
        <span className="text-[13.5px] font-medium">Cargando mapa…</span>
      </div>
    </div>
  );
}

/** Map loaded but no photos have GPS yet. */
export function MapNoGps({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="absolute inset-0 z-[400] grid place-items-center bg-bg/60 p-6 backdrop-blur-sm">
      <div className="flex max-w-sm flex-col items-center rounded-card border border-border bg-surface px-7 py-8 text-center shadow-lift">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
          <Photo size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.01em]">Aún no hay fotos en el mapa</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Ninguna de tus fotos tiene coordenadas GPS todavía. Sube fotos con ubicación
          o ubícalas manualmente desde el panel lateral.
        </p>
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-5 inline-flex h-[38px] items-center gap-2 rounded-control bg-primary px-4 text-[13.5px] font-semibold text-primary-fg shadow-[0_1px_2px_rgba(45,98,230,.35)] transition-colors hover:bg-primary-strong"
        >
          <Upload size={17} /> Subir fotos
        </button>
      </div>
    </div>
  );
}

/** Map failed to load. */
export function MapError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="absolute inset-0 z-[400] grid place-items-center bg-bg/70 p-6 backdrop-blur-sm">
      <div className="flex max-w-sm flex-col items-center rounded-card border border-border bg-surface px-7 py-8 text-center shadow-lift">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.01em]">No se pudo cargar el mapa</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Ocurrió un error al obtener los marcadores. Revisa tu conexión e inténtalo de nuevo.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex h-[38px] items-center rounded-control border border-border-strong bg-surface px-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-surface-3"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
