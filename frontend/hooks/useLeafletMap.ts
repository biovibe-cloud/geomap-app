"use client";

import { useEffect, useRef } from "react";
import type { Marker } from "@/lib/types";

export function useLeafletMap(
  markers: Marker[],
  options: {
    enabled: boolean;
    onMarkerClick?: (marker: Marker) => void;
    onMapClick?: (lat: number, lng: number) => void;
  },
) {
  const { enabled, onMarkerClick, onMapClick } = options;
  const clickRef = useRef(onMarkerClick);
  const onMapClickRef = useRef(onMapClick);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    clickRef.current = onMarkerClick;
    onMapClickRef.current = onMapClick;
  });

  // Effect 1: inicializar el mapa UNA SOLA VEZ
  useEffect(() => {
    if (!enabled || mapRef.current) return;

    (async () => {
      const L = await import("leaflet");
      const el = document.getElementById("map-container");
      if (!el || mapRef.current) return;

      const map = L.map(el, { zoomControl: true, attributionControl: false }).setView([20, 0], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e) => {
        onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      console.log("[LeafletMap] mapa creado");
      setTimeout(() => map.invalidateSize(), 200);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Effect 2: dibujar markers cuando cambian
  useEffect(() => {
    if (!enabled) return;

    (async () => {
      const L = await import("leaflet");
      const map = mapRef.current as ReturnType<typeof L.map> | null;
      if (!map) return;

      console.log("[LeafletMap] dibujando", markers.length, "markers");

      for (const m of markersRef.current) {
        (m as ReturnType<typeof L.marker>).remove();
      }
      markersRef.current = [];

      if (markers.length === 0) return;

      const pinIcon = L.divIcon({
        className: "gm-leaflet-pin",
        html: '<span class="gm-pin-inner"></span>',
        iconSize: [11, 11],
        iconAnchor: [5, 11],
        popupAnchor: [0, -10],
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
        marker.addTo(map);
        markersRef.current.push(marker);
        bounds.push([m.lat, m.lng]);
      }

      if (bounds.length > 0) {
        setTimeout(() => {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        }, 300);
      }
    })();
  }, [markers, enabled]);
}

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
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}