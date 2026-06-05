"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, computeStats } from "@/lib/api";
import type { LoadState, MapSummary, PhotoStats } from "@/lib/types";

export interface UseMapsResult {
  maps: MapSummary[];
  stats: PhotoStats | null;
  status: LoadState;
  error: string | null;
  /** Whether the failure was an expired/invalid session (HTTP 401). */
  sessionExpired: boolean;
  refetch: () => void;
}

/**
 * Loads the current user's maps and derives the dashboard stats.
 *
 * Keeps all fetching/lifecycle here so screens stay presentational: pass
 * `maps`, `stats`, `status`, `error` straight into <MapsDashboard /> as props.
 *
 * @param token in-memory JWT from useAuth(); omit while wiring auth.
 */
export function useMaps(token?: string): UseMapsResult {
  const [maps, setMaps] = useState<MapSummary[]>([]);
  const [stats, setStats] = useState<PhotoStats | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setSessionExpired(false);
    try {
      const data = await api.getMaps(token);
      setMaps(data);
      setStats(computeStats(data));
      setStatus("ready");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setSessionExpired(true);
      setError(e instanceof Error ? e.message : "Error al cargar los mapas.");
      setStatus("error");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { maps, stats, status, error, sessionExpired, refetch: load };
}
