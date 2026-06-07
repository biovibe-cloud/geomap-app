"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EmbedPanel } from "@/components/embed/EmbedPanel";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { AccessLogEntry } from "@/lib/types";

export default function EmbedPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const { token } = useAuth();
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [isPublic, setIsPublic] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;

    // Cargar estado real del mapa
    api.getMaps(token)
      .then((maps) => {
        if (!active) return;
        const map = maps.find((m) => m.id === mapId);
        if (map) setIsPublic(map.visibility === "public");
        else setIsPublic(false);
      })
      .catch(() => { if (active) setIsPublic(false); });

    // Cargar log de accesos
    api.getAccessLog(mapId, token)
      .then((log) => { if (active) setAccessLog(log); })
      .catch(() => {});

    return () => { active = false; };
  }, [mapId, token]);

  if (isPublic === null) {
    return (
      <div className="flex h-40 items-center justify-center text-ink-muted text-[13px]">
        Cargando…
      </div>
    );
  }

  return (
    <EmbedPanel
      isPublic={isPublic}
      embedToken={null}
      accessLog={accessLog}
      onPublish={async () => {
        const res = await api.publishMap(mapId, token ?? undefined);
        setIsPublic(true);
        return res;
      }}
      onUnpublish={async () => {
        await api.unpublishMap(mapId, token ?? undefined);
        setIsPublic(false);
      }}
    />
  );
}