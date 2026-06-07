"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LoadState, Marker, UnlocatedImage } from "@/lib/types";

export interface UseMapDataResult {
  markers: Marker[];
  unlocated: UnlocatedImage[];
  status: LoadState;
  error: string | null;
  /** Move a photo from `unlocated` into `markers` (optimistic). */
  locate: (imageId: string, lat: number, lng: number) => Promise<void>;
  refetch: () => void;
}

/**
 * Loads a map's markers and its unlocated photos in parallel, authenticating
 * with the in-memory JWT from useAuth(). A 401 triggers expireSession() so the
 * app can bounce to /login.
 *
 * Keeps fetching out of the screen components — <MapView /> receives plain
 * props and stays presentational.
 */
export function useMapData(mapId: string): UseMapDataResult {
  const { token, expireSession } = useAuth();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [unlocated, setUnlocated] = useState<UnlocatedImage[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      setError(null);
      try {
        const [m, u] = await Promise.all([
          api.getMarkers(mapId, token ?? undefined),
          api.getUnlocated(mapId, token ?? undefined),
        ]);
        if (!cancelled) {
          setMarkers(m);
          setUnlocated(u);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof ApiError && e.status === 401) expireSession();
          setError(e instanceof Error ? e.message : "Error al cargar el mapa.");
          setStatus("error");
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [mapId, token, expireSession, reloadKey]);

  const locate = useCallback(
    async (imageId: string, lat: number, lng: number) => {
      const img = unlocated.find((u) => u.image_id === imageId);
      // optimistic update
      setUnlocated((list) => list.filter((u) => u.image_id !== imageId));
      if (img) {
        setMarkers((list) => [
          ...list,
          { ...img, lat, lng, full_url: img.thumb_url },
        ]);
      }
      try {
        await api.setImageLocation(imageId, lat, lng, token ?? undefined);
      } catch (e) {
        // rollback on failure
        if (img) {
          setMarkers((list) => list.filter((m) => m.image_id !== imageId));
          setUnlocated((list) => [img, ...list]);
        }
        if (e instanceof ApiError && e.status === 401) expireSession();
        throw e;
      }
    },
    [unlocated, token, expireSession],
  );

  return { markers, unlocated, status, error, locate, refetch };
}
