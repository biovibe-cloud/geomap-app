import { MiniMap } from "./MiniMap";
import { StatusBadge, VisibilityLabel } from "./Badges";
import { MapActions, formatDate, formatNumber } from "./actions";
import { Eye, Kebab } from "@/components/ui/Icons";
import type { MapSummary } from "@/lib/types";

function Row({ map, actions }: { map: MapSummary; actions?: MapActions }) {
  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-2">
      <td className="px-[18px] py-[13px] align-middle">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 flex-none overflow-hidden rounded-[9px] border border-border">
            <MiniMap seed={map.previewSeed ?? 0} noGps={map.status === "no_gps"} />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-ink">{map.name}</div>
            <div className="mt-0.5 text-xs text-ink-muted">{formatDate(map.createdAt)}</div>
          </div>
        </div>
      </td>
      <td className="px-[18px] py-[13px] align-middle">
        <span className="font-medium tabular-nums text-ink">{formatNumber(map.photoCount)}</span>
      </td>
      <td className="px-[18px] py-[13px] align-middle">
        <StatusBadge status={map.status} />
      </td>
      <td className="px-[18px] py-[13px] align-middle">
        <VisibilityLabel visibility={map.visibility} />
      </td>
      <td className="px-[18px] py-[13px] align-middle">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => actions?.onOpen?.(map)}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-transparent bg-primary-50 px-2.5 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary-100"
          >
            <Eye size={14} /> Ver
          </button>
          <button
            type="button"
            aria-label="Más acciones"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink-soft"
          >
            <Kebab size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function MapsTable({ maps, actions }: { maps: MapSummary[]; actions?: MapActions }) {
  return (
    <div className="mt-[18px] overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Nombre", "Fotos", "Estado", "Visibilidad", ""].map((h, i) => (
              <th
                key={i}
                className="border-b border-border bg-surface-2 px-[18px] py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-ink-muted"
                style={i === 0 ? { width: "34%" } : i === 4 ? { width: 130 } : undefined}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {maps.map((m) => (
            <Row key={m.id} map={m} actions={actions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
