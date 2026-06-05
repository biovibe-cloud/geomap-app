import type { MapSummary, PhotoStats } from "./types";

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
  return res.json() as Promise<T>;
}

export const api = {
  getMaps: (token?: string) =>
    request<MapSummary[]>("/maps", token),
};

export function computeStats(maps: MapSummary[]): PhotoStats {
  const total = maps.reduce((sum, m) => sum + (m.photoCount ?? 0), 0);
  const located = maps.reduce((sum, m) => sum + (m.locatedCount ?? 0), 0);
  return {
    total,
    located,
    unlocated: Math.max(0, total - located),
    publicMaps: maps.filter((m) => m.is_public).length,
  };
}