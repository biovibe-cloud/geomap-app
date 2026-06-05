"use client";

import { useState } from "react";
import { MapsDashboard, type MapsView } from "@/components/maps/MapsDashboard";
import { useMaps } from "@/hooks/useMaps";
// import { useAuth } from "@/hooks/useAuth"; // wire the in-memory JWT here

/**
 * Dashboard route. Connects the useMaps() hook to the presentational
 * <MapsDashboard />. The component itself never touches the API.
 */
export default function MapsPage() {
  // const { token } = useAuth();
  const { maps, stats, status, error, refetch } = useMaps(/* token */);
  const [view, setView] = useState<MapsView>("list"); // lista por defecto

  return (
    <MapsDashboard
      status={status}
      maps={maps}
      stats={stats}
      error={error}
      view={view}
      onViewChange={setView}
      onRetry={refetch}
      onCreateMap={() => {
        /* open create-map modal */
      }}
      actions={{
        onOpen: (m) => {
          window.location.href = `/maps/${m.id}`;
        },
        onManageEmbed: (m) => {
          window.location.href = `/maps/${m.id}/embed`;
        },
        onDelete: (m) => {
          /* open delete confirm */
        },
      }}
    />
  );
}
