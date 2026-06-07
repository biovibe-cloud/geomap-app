"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MapView } from "@/components/map/MapView";
import { Uploader } from "@/components/upload/Uploader";
import { useMapData } from "@/hooks/useMapData";
import { useAuth } from "@/hooks/useAuth";

export default function MapPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const { token } = useAuth();
  const { markers, unlocated, status, locate, refetch } = useMapData(mapId);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  // mapName se obtiene del primer marcador o queda vacío hasta cargar
  const mapName = markers[0]?.filename ? "" : "";

  return (
    <div className="-mx-[30px] -mb-[30px] -mt-[26px] h-[calc(100%+56px)]">
      <MapView
        mapName={mapName}
        status={status}
        markers={markers}
        unlocated={unlocated}
        onUploadClick={() => setUploaderOpen(true)}
        onLocate={locate}
        onRetry={refetch}
      />
      <Uploader
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        mapId={mapId}
        onUpload={async (files) => {
          for (const file of files) {
            const form = new FormData();
            form.append("file", file);
            form.append("map_id", mapId);
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/upload`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: form,
            });
          }
          refetch();
        }}
      />
    </div>
  );
}