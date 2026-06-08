"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MapsDashboard, type MapsView } from "@/components/maps/MapsDashboard";
import { useMaps } from "@/hooks/useMaps";

export default function MapsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const { maps, stats, status, error, refetch } = useMaps(token ?? undefined);
  const [view, setView] = useState<MapsView>("list");
  const [creating, setCreating] = useState(false);
  const [newMapName, setNewMapName] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleLogout() {
    logout();
    router.push("/login");
  }

  async function handleCreateMap() {
    if (!newMapName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: newMapName.trim() }),
      });
      if (res.ok) {
        setNewMapName("");
        refetch();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <MapsDashboard
        status={status}
        maps={maps}
        stats={stats}
        error={error}
        view={view}
        onViewChange={setView}
        onRetry={refetch}
        onCreateMap={() => {
          const name = prompt("Nombre del mapa:");
          if (name?.trim()) {
            setNewMapName(name.trim());
          }
        }}
        actions={{
          onOpen: (m) => { router.push(`/maps/${m.id}`); },
          onManageEmbed: (m) => { router.push(`/maps/${m.id}/embed`); },
          onDelete: () => {},
        }}
      />
      {newMapName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-card border border-border bg-surface p-6 shadow-pop w-full max-w-sm">
            <h2 className="text-lg font-semibold">Crear mapa</h2>
            <p className="mt-2 text-base text-ink-muted">¿Crear el mapa <b>{newMapName}</b>?</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setNewMapName("")}
                className="inline-flex h-[38px] items-center rounded-control border border-border-strong bg-surface px-4 text-[13.5px] font-medium text-ink-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateMap}
                disabled={creating}
                className="inline-flex h-[38px] items-center rounded-control bg-primary px-4 text-[13.5px] font-semibold text-primary-fg disabled:opacity-50"
              >
                {creating ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}