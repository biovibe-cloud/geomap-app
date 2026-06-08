"use client";
import { cn } from "@/lib/cn";

/**
 * Stylized map thumbnail — a lightweight placeholder, NOT a real map.
 * Real Leaflet tiles render in the map view; here we just hint "this is a
 * map" with park/water blocks, pins and cluster bubbles.
 */
const LAYOUTS = [
  {
    park: [{ left: -10, top: 30, w: 70, h: 60 }, { left: 64, top: -8, w: 52, h: 46 }],
    water: { left: 58, top: 50, w: 60, h: 22, rot: -18 },
    pins: [[28, 40], [70, 64]],
    clusters: [[46, 30, 17], [80, 38, 24]],
  },
  {
    park: [{ left: 50, top: 44, w: 64, h: 56 }],
    water: { left: -8, top: -6, w: 46, h: 80, rot: 14 },
    pins: [[60, 30], [44, 70]],
    clusters: [[24, 50, 31], [74, 56, 12]],
  },
  {
    park: [{ left: 4, top: -10, w: 50, h: 50 }, { left: 58, top: 56, w: 56, h: 50 }],
    water: { left: 30, top: 60, w: 80, h: 18, rot: 8 },
    pins: [[36, 36], [66, 48], [52, 74]],
    clusters: [[78, 28, 58]],
  },
  {
    park: [{ left: -6, top: 40, w: 58, h: 60 }],
    water: { left: 52, top: -10, w: 30, h: 90, rot: -10 },
    pins: [[30, 30], [40, 60]],
    clusters: [[66, 44, 33], [22, 72, 9]],
  },
] as const;

export function MiniMap({
  seed = 0,
  noGps = false,
  className,
}: {
  seed?: number;
  noGps?: boolean;
  className?: string;
}) {
  const L = LAYOUTS[seed % LAYOUTS.length];
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-map-bg",
        "[background-image:repeating-linear-gradient(0deg,transparent_0_27px,var(--map-street)_27px_29px),repeating-linear-gradient(90deg,transparent_0_34px,var(--map-street)_34px_36px)]",
        className,
      )}
    >
      {L.park.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-[40%_55%_50%_45%] bg-map-park opacity-90"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.w}%`, height: `${p.h}%` }}
        />
      ))}
      <div
        className="absolute rounded-lg bg-map-water"
        style={{
          left: `${L.water.left}%`,
          top: `${L.water.top}%`,
          width: `${L.water.w}%`,
          height: `${L.water.h}%`,
          transform: `rotate(${L.water.rot}deg)`,
        }}
      />

      {noGps ? (
        <div className="absolute inset-0 grid place-items-center font-mono text-[10.5px] tracking-wide text-map-label">
          sin coordenadas
        </div>
      ) : (
        <>
          {L.clusters.map((c, i) => (
            <div
              key={`c${i}`}
              className="absolute flex h-[26px] min-w-[26px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/85 bg-success px-1.5 text-[11.5px] font-bold tabular-nums text-white shadow-[0_1px_4px_rgba(0,0,0,.3)]"
              style={{ left: `${c[0]}%`, top: `${c[1]}%` }}
            >
              {c[2]}
            </div>
          ))}
          {L.pins.map((p, i) => (
            <div
              key={`p${i}`}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-full rotate-45 rounded-[50%_50%_50%_0] border-[1.5px] border-white bg-primary shadow-[0_1px_3px_rgba(0,0,0,.3)] after:absolute after:inset-0 after:m-auto after:h-[5px] after:w-[5px] after:-rotate-45 after:rounded-full after:bg-white after:content-['']"
              style={{ left: `${p[0]}%`, top: `${p[1]}%` }}
            />
          ))}
        </>
      )}
    </div>
  );
}

