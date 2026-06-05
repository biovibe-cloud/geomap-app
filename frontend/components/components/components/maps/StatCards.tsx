import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Photo, Pin, PinSolid, Globe } from "@/components/ui/Icons";
import type { PhotoStats } from "@/lib/types";

function nf(n: number) {
  return n.toLocaleString("es-ES");
}

function Card({
  tone,
  icon,
  label,
  value,
  pct,
}: {
  tone: string;
  icon: ReactNode;
  label: string;
  value: string;
  pct?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-card border border-border bg-surface p-4 shadow-card">
      <div className={cn("flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px]", tone)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-ink-muted">{label}</div>
        <div className="mt-0.5 text-[23px] font-semibold tabular-nums tracking-[-0.02em]">
          {value}
          {pct && <small className="ml-1.5 text-[13px] font-medium text-ink-muted">{pct}</small>}
        </div>
      </div>
    </div>
  );
}

function pct(part: number, whole: number) {
  if (!whole) return undefined;
  return `${Math.round((part / whole) * 100)}%`;
}

export function StatCards({ stats }: { stats: PhotoStats }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <Card
        tone="bg-primary-50 text-primary"
        icon={<Photo size={20} />}
        label="Fotos totales"
        value={nf(stats.total)}
      />
      <Card
        tone="bg-success-soft text-success"
        icon={<Pin size={20} />}
        label="Fotos ubicadas"
        value={nf(stats.located)}
        pct={pct(stats.located, stats.total)}
      />
      <Card
        tone="bg-warning-soft text-warning"
        icon={<PinSolid size={19} />}
        label="Fotos sin ubicar"
        value={nf(stats.unlocated)}
        pct={pct(stats.unlocated, stats.total)}
      />
      <Card
        tone="bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent"
        icon={<Globe size={20} />}
        label="Mapas públicos"
        value={nf(stats.publicMaps)}
      />
    </div>
  );
}
