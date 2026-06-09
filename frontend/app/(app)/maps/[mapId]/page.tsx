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
  const { markers, unlocated, status, locate, refetch, mapName } = useMapData(mapId);
  const [uploaderOpen, setUploaderOpen] = useState(false);

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
        onClose={() => {
          setUploaderOpen(false);
          setTimeout(() => refetch(), 2000);
        }}
        mapId={mapId}
        onUpload={async () => {}}
      />
    </div>
  );
}