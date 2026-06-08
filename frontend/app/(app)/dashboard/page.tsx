"use client";
export const dynamic = "force-dynamic";

import { useShell } from "@/contexts/ShellContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MapsDashboard, type MapsView } from "@/components/maps/MapsDashboard";
import { useMaps } from "@/hooks/useMaps";

export default function MapsPage() {
  const { token, logout } = useAuth();
  const { setOnNewMap } = useShell();
  const router = useRouter();
  const { maps, stats, status, error, refetch } = useMaps(token ?? undefined);
  const [view, setView] = useState<MapsView>("list");
useEffect(() => {
    setOnNewMap(() => () => alert("Crear mapa — próximamente"));
  }, [setOnNewMap]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <MapsDashboard
      status={status}
      maps={maps}
      stats={stats}
      error={error}
      view={view}
      onViewChange={setView}
      onRetry={refetch}
      onCreateMap={() => alert("click funciona")}
      actions={{
        onOpen: (m) => { router.push(`/maps/${m.id}`); },
        onManageEmbed: (m) => { router.push(`/maps/${m.id}/embed`); },
        onDelete: () => {},
      }}
    />
  );
}