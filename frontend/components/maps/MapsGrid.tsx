import { MiniMap } from "./MiniMap";
import { StatusBadge, VisibilityChip } from "./Badges";
import { MapActions, formatDate, formatNumber } from "./actions";
import { Eye, Code, Kebab } from "@/components/ui/Icons";
import type { MapSummary } from "@/lib/types";

/** Single map as a card (grid view). */
export function MapCard({ map, actions }: { map: MapSummary; actions?: MapActions }) {
  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift">
      <div className="relative h-[124px] border-b border-border">
        <MiniMap seed={map.previewSeed ?? 0} noGps={map.status === "no_gps"} />
        <div className="absolute left-2.5 top-2.5 z-[2]">
          <VisibilityChip visibility={map.visibility ?? (map.visibility === "public" ? "public" : "private")} />
        </div>
        <button
          type="button"
          aria-label="Más acciones"
          className="absolute right-2.5 top-2.5 z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-white/85 text-ink-soft backdrop-blur-sm hover:bg-white dark:bg-black/55 dark:hover:bg-black/70"
        >
          <Kebab size={15} />
        </button>
      </div>

      <div className="px-[15px] pb-[15px] pt-[13px]">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{map.name}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-ink-muted">
          <span>{formatNumber(map.photoCount ?? 0)} fotos</span>
          <span className="h-[3px] w-[3px] rounded-full bg-ink-faint" />
          <span>{formatDate(map.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={map.status ?? "ready"} />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => actions?.onOpen?.(map)}
              className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-transparent bg-primary-50 px-2.5 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary-100"
            >
              <Eye size={14} /> Ver
            </button>
            <button
              type="button"
              aria-label="Gestionar embed"
              onClick={() => actions?.onManageEmbed?.(map)}
              className="inline-flex h-[30px] items-center rounded-lg border border-border-strong bg-surface px-2.5 text-ink-soft transition-colors hover:bg-surface-3"
            >
              <Code size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MapsGrid({ maps, actions }: { maps: MapSummary[]; actions?: MapActions }) {
  return (
    <div className="mt-[18px] grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {maps.map((m) => (
        <MapCard key={m.id} map={m} actions={actions} />
      ))}
    </div>
  );
}
