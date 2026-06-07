import type { UnlocatedImage } from "@/lib/types";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_LABEL = "JPEG, PNG, WEBP";
export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadPhase = "pending" | "uploading" | "gps" | "no_gps" | "error";

/** One file tracked through the upload lifecycle. */
export interface UploadItem {
  /** Stable client-side id (the File has no UUID until the server responds). */
  uid: string;
  file: File;
  phase: UploadPhase;
  /** 0–100 while uploading. */
  progress: number;
  /** Set once the server returns (UUID). */
  imageId?: string;
  lat?: number;
  lng?: number;
  /** Error message when phase === "error". */
  message?: string;
}

export interface ValidationResult {
  ok: File[];
  rejected: Array<{ file: File; reason: string }>;
}

/** Split incoming files into accepted vs rejected (type / size). */
export function validateFiles(files: File[]): ValidationResult {
  const ok: File[] = [];
  const rejected: Array<{ file: File; reason: string }> = [];
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
      rejected.push({ file, reason: `Formato no admitido (${ACCEPTED_LABEL})` });
    } else if (file.size > MAX_BYTES) {
      rejected.push({ file, reason: "Supera 10 MB" });
    } else {
      ok.push(file);
    }
  }
  return { ok, rejected };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let counter = 0;
export function makeUid(): string {
  counter += 1;
  return `u${Date.now().toString(36)}-${counter}`;
}

export interface UploadSummary {
  total: number;
  gps: number;
  noGps: number;
  error: number;
}

export function summarize(items: UploadItem[]): UploadSummary {
  return {
    total: items.length,
    gps: items.filter((i) => i.phase === "gps").length,
    noGps: items.filter((i) => i.phase === "no_gps").length,
    error: items.filter((i) => i.phase === "error").length,
  };
}

/** True when every item has reached a terminal phase. */
export function isComplete(items: UploadItem[]): boolean {
  return items.length > 0 && items.every((i) => ["gps", "no_gps", "error"].includes(i.phase));
}

export type { UnlocatedImage };
