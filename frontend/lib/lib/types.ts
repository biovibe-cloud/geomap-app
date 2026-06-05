/** GeoMap domain types (shared across the maps dashboard). */

export type MapStatus = "ready" | "processing" | "no_gps";
export type Visibility = "public" | "private";

/** A single map as shown in the dashboard list (from `GET /maps`). */
export interface MapSummary {
  id: string;
  name: string;
  /** Total photos in the map. */
  photoCount: number;
  /** Photos that already have GPS coordinates (optional — used for stats). */
  locatedCount?: number;
  /** ISO date the map was created. */
  createdAt: string;
  status: MapStatus;
  visibility: Visibility;
  /** Optional 0–3 seed to vary the stylized map thumbnail. */
  previewSeed?: number;
}

/** Aggregate numbers shown in the stat cards. */
export interface PhotoStats {
  total: number;
  located: number;
  unlocated: number;
  publicMaps: number;
}

/** Async load lifecycle for a data-fetching screen. */
export type LoadState = "loading" | "error" | "ready";
