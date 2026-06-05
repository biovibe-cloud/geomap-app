"use client";

import { cn } from "@/lib/cn";
import { StatCards } from "./StatCards";
import { MapsTable } from "./MapsTable";
import { MapsGrid } from "./MapsGrid";
import { EmptyState } from "./states/EmptyState";
import { ErrorState } from "./states/ErrorState";
import { MapsSkeleton } from "./states/MapsSkeleton";
import { MapActions, formatNumber } from "./actions";
import { Grid, List, Filter, Sort, ChevronDown } from "@/components/ui/Icons";
import type { LoadState, MapSummary, PhotoStats } from "@/lib/types";

export type MapsView = "list" | "grid";

export interface MapsDashboardProps {
  /** Async lifecycle — drives which state renders. */
  status: LoadState;
  /** Maps to show (empty array + status "ready" → empty state). */
  maps: MapSummary[];
  /** Aggregate stat cards. Omit to hide them. */
  stats?: PhotoStats | null;
  /** Error message for the error state. */
  error?: string | null;
  /** Current view; controlled by the parent. */
  view: MapsView;
  onViewChange: (view: MapsView) => void;
  onRetry?: () => void;
  onCreateMap?: () => void;
  /** Per-map row/card actions. */
  actions?: MapActions;
}

function ViewToggle({ view, onChange }: { view: MapsView; onChange: (v: MapsView) => void }) {
  return (
    <div className="inline-flex gap-0.5 rounded-[9px] bg-surface-3 p-[3px]">
      {([["list", List], ["grid", Grid]] as const).map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          aria-label={key === "list" ? "Vista de lista" : "Vista de cuadrícula"}
          aria-pressed={view === key}
          onClick={() => onChange(key)}
          className={cn(
            "flex h-[30px] w-8 items-center justify-center rounded-md transition-colors",
            view === key ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-soft",
          )}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-control border border-border-strong bg-surface px-3 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-surface-3"
    >
      {children}
    </button>
  );
}

/**
 * Maps dashboard — fully presentational. All data and callbacks arrive via
 * props (wire it to the API with the useMaps hook in the page). Renders the
 * loading / error / empty / ready states.
 */
export function MapsDashboard({
  status,
  maps,
  stats,
  error,
  view,
  onViewChange,
  onRetry,
  onCreateMap,
  actions,
}: MapsDashboardProps) {
  const hasData = status === "ready" && maps.length > 0;

  const subtitle =
    status === "loading"
      ? "Cargando tus mapas…"
      : status === "error"
        ? "—"
        : maps.length === 0
          ? "Aún no tienes mapas"
          : `${maps.length} ${maps.length === 1 ? "mapa" : "mapas"}${
              stats ? ` · ${formatNumber(stats.total)} fotos en total` : ""
            }`;

  return (
    <div>
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.02em]">Mis mapas</h1>
          <p className="mt-1.5 text-base text-ink-muted">{subtitle}</p>
        </div>

        {hasData && (
          <div className="flex items-center gap-2.5">
            <ViewToggle view={view} onChange={onViewChange} />
            <ToolbarButton>
              <Filter size={15} /> Filtrar
            </ToolbarButton>
            <ToolbarButton>
              <Sort size={15} /> Más recientes <ChevronDown size={14} />
            </ToolbarButton>
          </div>
        )}
      </header>

      {status === "loading" && <MapsSkeleton />}
      {status === "error" && <ErrorState message={error} onRetry={onRetry} />}
      {status === "ready" && maps.length === 0 && <EmptyState onCreateMap={onCreateMap} />}

      {hasData && (
        <>
          {stats && <StatCards stats={stats} />}
          {view === "list" ? (
            <MapsTable maps={maps} actions={actions} />
          ) : (
            <MapsGrid maps={maps} actions={actions} />
          )}
        </>
      )}
    </div>
  );
}
