"use client";

import { useParams } from "next/navigation";
import { PublicMapView } from "@/components/embed/PublicMapView";
import { usePublicMarkers } from "@/hooks/usePublicMarkers";

export default function EmbedTokenPage() {
  const { token } = useParams<{ token: string }>();
  const { markers, status, unavailable } = usePublicMarkers(token);

  return <PublicMapView status={status} markers={markers} unavailable={unavailable} />;
}