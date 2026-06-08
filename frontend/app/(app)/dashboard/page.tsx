"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MapsDashboard, type MapsView } from "@/components/maps/MapsDashboard";
import { useMaps } from "@/hooks/useMaps";

export default function MapsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { maps, stats, status, error, refetch } = useMaps(token ?? undefined);
  const [view, setView] = useState<MapsView>("list");

  return (
    <MapsDashboard
      status={status}
      maps={maps}
      stats={stats}
      error={error}
      view={view}
      onViewChange={setView}
      onRetry={refetch}
      onCreateMap={async () => {
        const name = prompt("Nombre del nuevo mapa:");
        if (!name?.trim()) return;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maps`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ name: name.trim() }),
          });
          if (res.ok) refetch();
        } catch {
          alert("No se pudo crear el mapa.");
        }
      }}
      actions={{
        onOpen: (m) => { router.push(`/maps/${m.id}`); },
        onManageEmbed: (m) => { router.push(`/maps/${m.id}/embed`); },
        onDelete: () => {},
      }}
    />
  );
}