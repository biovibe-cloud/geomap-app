"use client";
import { cn } from "@/lib/cn";
import { Globe, Lock } from "@/components/ui/Icons";
import type { MapStatus, Visibility } from "@/lib/types";

const STATUS_MAP: Record<MapStatus, { label: string; className: string; pulse?: boolean }> = {
  ready: { label: "Listo", className: "bg-success-soft text-success" },
  processing: { label: "Procesando", className: "bg-primary-50 text-primary", pulse: true },
  no_gps: { label: "Sin GPS", className: "bg-warning-soft text-warning" },
};

export function StatusBadge({ status }: { status: MapStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex h-[23px] items-center gap-1.5 rounded-chip px-2.5 text-xs font-semibold",
        s.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", s.pulse && "animate-pulseDot")} />
      {s.label}
    </span>
  );
}

/** Inline visibility (icon + text) — used in the table. */
export function VisibilityLabel({ visibility }: { visibility: Visibility }) {
  return visibility === "public" ? (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted">
      <Globe size={14} /> Público
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted">
      <Lock size={14} /> Privado
    </span>
  );
}

/** Floating chip overlaid on the card thumbnail. */
export function VisibilityChip({ visibility }: { visibility: Visibility }) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1.5 rounded-chip bg-white/85 px-2 text-[11.5px] font-semibold text-ink-soft backdrop-blur-sm dark:bg-black/55">
      {visibility === "public" ? <Globe size={12} /> : <Lock size={12} />}
      {visibility === "public" ? "Público" : "Privado"}
    </span>
  );
}

