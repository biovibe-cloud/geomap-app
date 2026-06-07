"use client";

import { cn } from "@/lib/cn";
import { Spinner, Check, AlertTriangle, MapPin, X } from "@/components/ui/Icons";
import { formatBytes, type UploadItem } from "./uploadModel";

const PHASE_META = {
  pending: { label: "En cola", className: "text-ink-muted" },
  uploading: { label: "Subiendo", className: "text-primary" },
  gps: { label: "GPS encontrado", className: "text-success" },
  no_gps: { label: "Sin GPS", className: "text-warning" },
  error: { label: "Error", className: "text-danger" },
} as const;

/** A single file row inside the uploader. */
export function UploadRow({
  item,
  onLocateManually,
  onRemove,
}: {
  item: UploadItem;
  onLocateManually?: (item: UploadItem) => void;
  onRemove?: (item: UploadItem) => void;
}) {
  const meta = PHASE_META[item.phase];

  return (
    <li className="flex items-center gap-3 rounded-control border border-border bg-surface px-3 py-2.5">
      <Thumb item={item} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13.5px] font-medium text-ink" title={item.file.name}>
            {item.file.name}
          </span>
          <span className="flex-none font-mono text-[11px] text-ink-faint">
            {formatBytes(item.file.size)}
          </span>
        </div>

        {item.phase === "uploading" ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        ) : (
          <div className={cn("mt-1 flex items-center gap-1.5 text-[12px] font-medium", meta.className)}>
            <PhaseIcon phase={item.phase} />
            <span>{meta.label}</span>
            {item.phase === "gps" && item.lat != null && item.lng != null && (
              <span className="font-mono text-[11px] text-ink-faint">
                · {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
              </span>
            )}
            {item.phase === "error" && item.message && (
              <span className="truncate text-ink-muted">· {item.message}</span>
            )}
          </div>
        )}
      </div>

      {/* trailing action */}
      {item.phase === "no_gps" && onLocateManually && (
        <button
          type="button"
          onClick={() => onLocateManually(item)}
          className="inline-flex h-7 flex-none items-center gap-1 rounded-md border border-transparent bg-warning-soft px-2 text-[12px] font-semibold text-warning transition-colors hover:brightness-95"
        >
          <MapPin size={13} /> Ubicar
        </button>
      )}
      {(item.phase === "pending" || item.phase === "error") && onRemove && (
        <button
          type="button"
          aria-label="Quitar"
          onClick={() => onRemove(item)}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink-soft"
        >
          <X size={15} />
        </button>
      )}
    </li>
  );
}

function Thumb({ item }: { item: UploadItem }) {
  const url = URL.createObjectURL(item.file);
  return (
    <div className="relative h-11 w-11 flex-none overflow-hidden rounded-lg border border-border bg-surface-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={item.file.name} className="h-full w-full object-cover" />
      {item.phase === "uploading" && (
        <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
          <Spinner size={16} />
        </div>
      )}
    </div>
  );
}

function PhaseIcon({ phase }: { phase: UploadItem["phase"] }) {
  if (phase === "gps") return <Check size={13} />;
  if (phase === "no_gps") return <AlertTriangle size={13} />;
  if (phase === "error") return <AlertTriangle size={13} />;
  if (phase === "uploading") return <Spinner size={13} />;
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}
