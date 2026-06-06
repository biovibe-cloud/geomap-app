export type MapStatus = "ready" | "processing" | "no_gps";
export type Visibility = "public" | "private";

export interface MapSummary {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  photoCount?: number;
  locatedCount?: number;
  status?: MapStatus;
  previewSeed?: number;
  visibility?: Visibility;
  createdAt?: string;
}

export interface PhotoStats {
  total: number;
  located: number;
  unlocated: number;
  publicMaps: number;
}

export type LoadState = "loading" | "error" | "ready";