import type {
  AccessLogEntry,
  Marker,
  MapStatus,
  MapSummary,
  PhotoStats,
  RawAccessLogEntry,
  RawMap,
  RawMarker,
  RawUnlocatedImage,
  UnlocatedImage,
} from "./types";

/**
 * Thin API client. Base URL comes from NEXT_PUBLIC_API_URL; the JWT is held
 * in memory (see AuthContext) and passed in per request so this module stays
 * free of React state.
 *
 * IMPORTANT — this layer normalizes the *real* backend payloads into the UI
 * types the components expect:
 *   GET /maps                        → direct array of RawMap
 *   GET /maps/{id}/markers           → { markers: RawMarker[] }
 *   GET /maps/{id}/images/unlocated  → { images: RawUnlocatedImage[] }
 *   GET /maps/{id}/embed/access-log  → { logs: RawAccessLogEntry[] }
 * Parsing is tolerant: each reader accepts either the wrapped object OR a bare
 * array, so a backend tweak won't break the screens.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.");
  }

  if (res.status === 401) throw new ApiError("Tu sesión expiró.", 401);
  if (!res.ok) throw new ApiError("No se pudieron cargar los datos.", res.status);

  // 204 / empty body tolerance
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/* ----------------------------- normalizers ----------------------------- */

/** Pull an array out of either a bare array or a `{ [key]: [] }` wrapper. */
function unwrap<T>(payload: unknown, key: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const val = (payload as Record<string, unknown>)[key];
    if (Array.isArray(val)) return val as T[];
  }
  return [];
}

/** Map the backend status string onto our 3 UI states (tolerant). */
function normalizeStatus(raw: RawMap): MapStatus {
  const s = (raw.status ?? "").toLowerCase();
  if (s.includes("process") || s.includes("proces")) return "processing";
  if (s.includes("no_gps") || s.includes("nogps")) return "no_gps";
  if (s === "ready" || s === "listo") return "ready";
  // Derive a sensible default from counts when no explicit status.
  const photos = raw.photo_count ?? 0;
  const located = raw.located_count ?? 0;
  if (photos > 0 && located === 0) return "no_gps";
  return "ready";
}

/** RawMap (snake_case, is_public, created_at) → UI MapSummary. */
export function normalizeMap(raw: RawMap, index = 0): MapSummary {
  return {
    id: raw.id,
    name: raw.name,
    photoCount: raw.photo_count ?? 0,
    locatedCount: raw.located_count,
    createdAt: raw.created_at ?? "",
    status: normalizeStatus(raw),
    visibility: raw.is_public ? "public" : "private",
    previewSeed: index % 4,
  };
}

/* ------------------------------- the API ------------------------------- */

export const api = {
  /** `GET /maps` returns a direct array. */
  getMaps: (token?: string) =>
    request<unknown>("/maps", token).then((data) =>
      unwrap<RawMap>(data, "maps").map(normalizeMap),
    ),

  /** `GET /maps/{id}/markers` → { markers: [...] } (or bare array). */
  getMarkers: (mapId: string, token?: string) =>
    request<unknown>(`/maps/${mapId}/markers`, token).then(
      (data) => unwrap<RawMarker>(data, "markers") as Marker[],
    ),

  /** `GET /maps/{id}/images/unlocated` → { images: [...] }. */
  getUnlocated: (mapId: string, token?: string) =>
    request<unknown>(`/maps/${mapId}/images/unlocated`, token).then(
      (data) => unwrap<RawUnlocatedImage>(data, "images") as UnlocatedImage[],
    ),

  /** Manually set coordinates for a photo. */
  setImageLocation: (imageId: string, lat: number, lng: number, token?: string) =>
    request<{ image_id: string; lat: number; lng: number }>(
      `/images/${imageId}/location`,
      token,
      { method: "PATCH", body: JSON.stringify({ lat, lng }) },
    ),

  /** Publish a map → one-time embed token. */
  publishMap: (mapId: string, token?: string) =>
    request<{ embed_token: string }>(`/maps/${mapId}/publish`, token, {
      method: "POST",
    }),

  /** Revoke public access. */
  unpublishMap: (mapId: string, token?: string) =>
    request<unknown>(`/maps/${mapId}/unpublish`, token, { method: "POST" }),

  /** `GET /maps/{id}/embed/access-log` → { logs: [...] }. */
  getAccessLog: (mapId: string, token?: string) =>
    request<unknown>(`/maps/${mapId}/embed/access-log`, token).then(
      (data) => unwrap<RawAccessLogEntry>(data, "logs") as AccessLogEntry[],
    ),

  /**
   * Public markers for the embed page — no auth, token in the query string.
   * `GET /api/public/markers?token=X` → { markers: [...] } (or bare array).
   */
  getPublicMarkers: (token: string) =>
    request<unknown>(`/api/public/markers?token=${encodeURIComponent(token)}`).then(
      (data) => unwrap<RawMarker>(data, "markers") as Marker[],
    ),
};

/** Derive the dashboard stat cards from the maps list (no extra endpoint). */
export function computeStats(maps: MapSummary[]): PhotoStats {
  const total = maps.reduce((sum, m) => sum + m.photoCount, 0);
  const located = maps.reduce((sum, m) => sum + (m.locatedCount ?? 0), 0);
  return {
    total,
    located,
    unlocated: Math.max(0, total - located),
    publicMaps: maps.filter((m) => m.visibility === "public").length,
  };
}
