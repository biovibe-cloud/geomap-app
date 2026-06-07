"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { LoadState, Marker } from "@/lib/types";

export interface UsePublicMarkersResult {
  markers: Marker[];
  status: LoadState;
  unavailable: boolean;
  refetch: () => void;
}

export function usePublicMarkers(token: string): UsePublicMarkersResult {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [unavailable, setUnavailable] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      setUnavailable(false);
      if (!token) {
        if (!cancelled) { setUnavailable(true); setStatus("error"); }
        return;
      }
      try {
        const data = await api.getPublicMarkers(token);
        if (!cancelled) { setMarkers(data); setStatus("ready"); }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
            setUnavailable(true);
          }
          setStatus("error");
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token, reloadKey]);

  return { markers, status, unavailable, refetch };
}