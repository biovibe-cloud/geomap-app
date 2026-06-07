"use client";

import { useEffect } from "react";
import type { Marker } from "@/lib/types";

/**
 * Full-screen lightbox for a marker's large image (~1200x900, full_url).
 * Closes on Esc / backdrop click. Purely visual - no Leaflet here.
 */
export function Lightbox({ marker, onClose }: { marker: Marker | null; onClose: () => void }) {
  useEffect(() => {
    if (!marker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [marker, onClose]);

  if (!marker) return null;

  const date = new Date(marker.taken_at);
  const label = Number.isNaN(date.getTime())
    ? marker.taken_at
    : date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={marker.filename}
      onClick={onClose}
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-[1200px] flex-col overflow-hidden rounded-card bg-surface shadow-pop"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={marker.full_url} alt={marker.filename} className="max-h-[78vh] w-auto object-contain" />
        <figcaption className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-ink">{marker.filename}</div>
            <div className="text-[12.5px] text-ink-muted">{label}</div>
          </div>
          <div className="font-mono text-[11.5px] text-ink-muted">
            {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
          </div>
        </figcaption>
      </figure>

      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
