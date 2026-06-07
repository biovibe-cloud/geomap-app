"use client";

import { cn } from "@/lib/cn";
import { Upload, ChevronLeft, MapPin } from "@/components/ui/Icons";
import type { Marker, UnlocatedImage } from "@/lib/types";

function formatCount(n: number): string {
  return n.toLocaleString("es-ES");
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export interface MapSidebarProps {
  mapName: string;
  markers: Marker[];
  unlocated: UnlocatedImage[];
  open: boolean;
  onToggle: () => void;
  onUploadClick: () => void;
  /** Begin placing this photo on the map (parent enters "locate" mode). */
  onLocateRequest: (image: UnlocatedImage) => void;
}

/**
 * Collapsible left panel for the map view. 280px open, 0 closed.
 * Lists photos without GPS, each with a "Ubicar" action.
 */
export function MapSidebar({
  mapName,
  markers,
  unlocated,
  open,
  onToggle,
  onUploadClick,
  onLocateRequest,
}: MapSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "relative flex h-full flex-none flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out",
          open ? "w-[280px]" : "w-0",
        )}
      >
        <div className={cn("flex h-full w-[280px] flex-col", !open && "pointer-events-none opacity-0")}>
          {/* header */}
          <div className="border-b border-border px-4 py-4">
            <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em]" title={mapName}>
              {mapName}
            </h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              {formatCount(markers.length + unlocated.length)} fotos ·{" "}
              <span className="text-success">{formatCount(markers.length)} ubicadas</span>
            </p>
            <button
              type="button"
              onClick={onUploadClick}
              className="mt-3.5 flex h-[38px] w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-[13.5px] font-semibold text-primary-fg shadow-[0_1px_2px_rgba(45,98,230,.35)] transition-colors hover:bg-primary-strong"
            >
              <Upload size={17} /> Subir fotos
            </button>
          </div>

          {/* unlocated list */}
          <div className="flex items-center justify-between px-4 pb-1.5 pt-4">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
              Sin ubicar
            </span>
            {unlocated.length > 0 && (
              <span className="rounded-chip bg-warning-soft px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                {formatCount(unlocated.length)}
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
            {unlocated.length === 0 ? (
              <p className="px-1.5 py-6 text-center text-[13px] leading-relaxed text-ink-muted">
                Todas tus fotos están ubicadas en el mapa. 🎉
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {unlocated.map((img) => (
                  <li
                    key={img.image_id}
                    className="group flex items-center gap-2.5 rounded-control p-1.5 transition-colors hover:bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumb_url}
                      alt={img.filename}
                      className="h-11 w-11 flex-none rounded-lg border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-ink" title={img.filename}>
                        {img.filename}
                      </div>
                      <div className="text-[11.5px] text-ink-muted">{shortDate(img.taken_at)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLocateRequest(img)}
                      className="inline-flex h-7 flex-none items-center gap-1 rounded-md border border-transparent bg-primary-50 px-2 text-[12px] font-medium text-primary transition-colors hover:bg-primary-100"
                    >
                      <MapPin size={13} /> Ubicar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>

      {/* collapse handle (always visible, sits on the divider) */}
      <button
        type="button"
        aria-label={open ? "Colapsar panel" : "Expandir panel"}
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 z-[500] flex h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-border bg-surface text-ink-muted shadow-sm transition-all hover:text-ink",
          open ? "left-[280px]" : "left-0",
        )}
      >
        <ChevronLeft size={16} className={cn("transition-transform", !open && "rotate-180")} />
      </button>
    </>
  );
}
