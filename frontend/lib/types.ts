/** GeoMap domain types (shared across the maps dashboard).
 *
 * Two layers live here on purpose:
 *  · `Raw*` types mirror the backend payloads exactly (snake_case,
 *    `created_at`, `is_public`, optional fields) — what the API returns.
 *  · The UI types (`MapSummary`, etc.) are the normalized shape the
 *    components consume. `lib/api.ts` maps Raw → UI so the screens never
 *    depend on backend naming and existing, tested components don't change.
 */

export type MapStatus = "ready" | "processing" | "no_gps";
export type Visibility = "public" | "private";

/* ---------- Raw backend payloads (snake_case, as received) ---------- */

/** Raw map object from `GET /maps` (returns a direct array of these). */
export interface RawMap {
  id: string;
  name: string;
  created_at?: string;
  is_public?: boolean;
  /** Backend may send any of these for counts; all optional. */
  photo_count?: number;
  located_count?: number;
  unlocated_count?: number;
  /** Free-form status string if the backend sends one. */
  status?: string;
}

/** Raw marker (already snake_case in the backend — matches `Marker`). */
export interface RawMarker {
  image_id: string;
  lat: number;
  lng: number;
  taken_at: string;
  filename: string;
  thumb_url: string;
  full_url: string;
}

/** Raw unlocated image. */
export interface RawUnlocatedImage {
  image_id: string;
  filename: string;
  taken_at: string;
  thumb_url: string;
}

/** Raw access-log entry. */
export interface RawAccessLogEntry {
  accessed_at: string;
  user_agent_short: string;
}

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

/** A geolocated photo shown as a marker (from `GET /maps/{id}/markers`). */
export interface Marker {
  image_id: string;
  lat: number;
  lng: number;
  /** ISO datetime the photo was taken (EXIF). */
  taken_at: string;
  filename: string;
  /** Small preview (≈400×300). */
  thumb_url: string;
  /** Full-size image (≈1200×900) for the lightbox. */
  full_url: string;
}

/** A photo with no GPS yet (from `GET /maps/{id}/images/unlocated`). */
export interface UnlocatedImage {
  image_id: string;
  filename: string;
  taken_at: string;
  thumb_url: string;
}

/** A single embed access record (from `GET /maps/{id}/embed/access-log`). */
export interface AccessLogEntry {
  /** ISO datetime of the access. */
  accessed_at: string;
  /** Short UA label, e.g. "Chrome · macOS". No IP. */
  user_agent_short: string;
}
