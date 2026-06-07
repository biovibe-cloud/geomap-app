"use client";

import { useEffect, useRef } from "react";
import type { Marker } from "@/lib/types";

/**
 * Initializes a Leaflet map inside #map-container and renders markers with
 * clustering. Leaflet (and the markercluster plugin) are imported dynamically
 * inside the effect so they never run on the server — the component that uses
 * this hook must NOT import "leaflet" itself.
 *
 * Hover a marker -> opens its popup (thumbnail + date).
 * Click a marker -> calls onMarkerClick(marker) so the page can open a lightbox.
 *
 * Requires Leaflet's CSS + markercluster CSS to be loaded globally, e.g. in
 * app/layout.tsx:
 *   import "leaflet/dist/leaflet.css";
 *   import "leaflet.markercluster/dist/MarkerCluster.css";
 */
export function useLeafletMap(
  markers: Marker[],
  options: {
    enabled: boolean;
    onMarkerClick?: (marker: Marker) => void;
  },
) {
  const { enabled, onMarkerClick } = options;
  // keep latest click handler without re-running the whole init effect
  const clickRef = useRef(onMarkerClick);
  useEffect(() => {
    clickRef.current = onMarkerClick;
  });
  // Leaflet's map instance + the cluster layer, kept across renders.
  const mapRef = useRef<unknown>(null);
  const clusterRef = useRef<unknown>(null);

  // 1) create the map once the container exists
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet.markercluster");
      if (disposed) return;

      const el = document.getElementById("map-container");
      if (!el || mapRef.current) return;

      const map = L.map(el, { zoomControl: true, attributionControl: false }).setView(
        [20, 0],
        2,
      );
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // markercluster augments L at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 48,
      });
      map.addLayer(cluster);

      mapRef.current = map;
      clusterRef.current = cluster;
    })();

    return () => {
      disposed = true;
    };
  }, [enabled]);

  // 2) (re)draw markers whenever the data changes
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;

    (async () => {
      const L = await import("leaflet");
      if (disposed) return;
      const map = mapRef.current as ReturnType<typeof L.map> | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = clusterRef.current as any;
      if (!map || !cluster) return;

      cluster.clearLayers();
      if (markers.length === 0) return;

      const pinIcon = L.divIcon({
        className: "gm-leaflet-pin",
        html: '<span class="gm-pin-inner"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        popupAnchor: [0, -20],
      });

      const bounds: [number, number][] = [];
      for (const m of markers) {
        const marker = L.marker([m.lat, m.lng], { icon: pinIcon });
        marker.bindPopup(popupHtml(m), {
          className: "gm-popup",
          minWidth: 220,
          closeButton: false,
        });
        marker.on("mouseover", () => marker.openPopup());
        marker.on("click", () => clickRef.current?.(m));
        cluster.addLayer(marker);
        bounds.push([m.lat, m.lng]);
      }
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    })();

    return () => {
      disposed = true;
    };
  }, [markers, enabled]);
}

/** Popup markup - thumbnail (~400x300) + filename + date. */
function popupHtml(m: Marker): string {
  const date = new Date(m.taken_at);
  const label = Number.isNaN(date.getTime())
    ? m.taken_at
    : date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  return `
    <div class="gm-popup-card">
      <img src="${m.thumb_url}" alt="${escapeHtml(m.filename)}" width="220" height="150" loading="lazy" />
      <div class="gm-popup-meta">
        <span class="gm-popup-name">${escapeHtml(m.filename)}</span>
        <span class="gm-popup-date">${label}</span>
      </div>
    </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
