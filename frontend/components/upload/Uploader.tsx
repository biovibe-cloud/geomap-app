"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Upload, Info, X, Check, AlertTriangle } from "@/components/ui/Icons";
import { UploadRow } from "./UploadRow";
import {
  ACCEPTED_LABEL,
  isComplete,
  makeUid,
  summarize,
  validateFiles,
  type UploadItem,
} from "./uploadModel";
import { useAuth } from "@/hooks/useAuth";

export interface UploaderProps {
  isOpen: boolean;
  onClose: () => void;
  /** Performs the actual upload; resolves when all files are processed. */
  onUpload: (files: File[]) => Promise<void>;
  mapId: string;
}

/**
 * Drag & drop uploader modal. Validates type/size, shows per-file progress and
 * the GPS / no-GPS / error outcome, plus a summary when everything finishes.
 *
 * The real upload work is delegated to `onUpload`; this component owns only the
 * UI lifecycle. (Wire onUpload to POST /images/upload — see the map page.)
 */
export function Uploader({ isOpen, onClose, onUpload: _, mapId }: UploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [rejected, setRejected] = useState<Array<{ name: string; reason: string }>>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
const { token } = useAuth();
  const refetchRef = useRef<(() => void) | null>(null);
  // reset when closed
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setItems([]);
      setRejected([]);
      setDragging(false);
      setBusy(false);
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Esc to close (unless mid-upload)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, busy, onClose]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const { ok, rejected: bad } = validateFiles(Array.from(files));
    if (bad.length) {
      setRejected((r) => [...r, ...bad.map((b) => ({ name: b.file.name, reason: b.reason }))]);
    }
    if (ok.length) {
      setItems((list) => [
        ...list,
        ...ok.map((file) => ({ uid: makeUid(), file, phase: "pending" as const, progress: 0 })),
      ]);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  // Simulated lifecycle for the design handoff. In production, drive these
  // state transitions from onUpload's real progress + server response.
  const startUpload = async () => {
    setBusy(true);
    const pending = items.filter((i) => i.phase === "pending");

    for (const item of pending) {
      setItems((list) =>
        list.map((i) => i.uid === item.uid ? { ...i, phase: "uploading" as const, progress: 0 } : i)
      );

      try {
        const form = new FormData();
        form.append("file", item.file);
        if (mapId) form.append("map_id", mapId);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setItems((list) =>
            list.map((i) =>
              i.uid === item.uid
                ? { ...i, phase: "error" as const, message: err.detail ?? "Error al subir" }
                : i
            )
          );
          continue;
        }

        const data = await res.json();
        setItems((list) =>
          list.map((i) =>
            i.uid === item.uid
              ? {
                  ...i,
                  phase: data.has_gps ? ("gps" as const) : ("no_gps" as const),
                  imageId: data.image_id,
                  lat: data.lat ?? undefined,
                  lng: data.lng ?? undefined,
                  progress: 100,
                }
              : i
          )
        );
      } catch {
        setItems((list) =>
          list.map((i) =>
            i.uid === item.uid
              ? { ...i, phase: "error" as const, message: "No se pudo conectar" }
              : i
          )
        );
      }
    }

    setBusy(false);
    refetchRef.current?.();
  };

  if (!isOpen) return null;

  const summary = summarize(items);
  const complete = isComplete(items);
  const hasPending = items.some((i) => i.phase === "pending");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Subir fotos"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-pop"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Subir fotos</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">{ACCEPTED_LABEL} · máx 10 MB por archivo</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink-soft disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* privacy warning */}
          <div className="flex items-start gap-2.5 rounded-control border border-warning/30 bg-warning-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-warning">
            <Info size={16} className="mt-px flex-none" />
            <span>Tus imágenes contienen datos de ubicación que serán usados para el mapa.</span>
          </div>

          {/* dropzone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-9 text-center transition-colors",
              dragging
                ? "border-primary bg-primary-50"
                : "border-border-strong bg-surface-2 hover:border-primary/60 hover:bg-primary-50/40",
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">
              <Upload size={22} />
            </span>
            <span className="mt-1 text-[14px] font-semibold text-ink">
              Arrastra tus fotos aquí
            </span>
            <span className="text-[12.5px] text-ink-muted">o haz clic para seleccionarlas</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {/* rejected files */}
          {rejected.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {rejected.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px] text-danger">
                  <AlertTriangle size={13} className="flex-none" />
                  <span className="truncate">
                    <b>{r.name}</b> — {r.reason}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* file list */}
          {items.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {items.map((item) => (
                <UploadRow
                  key={item.uid}
                  item={item}
                  onRemove={(it) => setItems((l) => l.filter((x) => x.uid !== it.uid))}
                  onLocateManually={() => {
                    /* open the map in locate mode for it.imageId */
                  }}
                />
              ))}
            </ul>
          )}

          {/* completion summary */}
          {complete && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-control border border-border bg-surface-2 px-4 py-3 text-[12.5px]">
              <span className="font-semibold text-ink">Resumen:</span>
              <span className="inline-flex items-center gap-1 text-success">
                <Check size={14} /> {summary.gps} con GPS
              </span>
              <span className="inline-flex items-center gap-1 text-warning">
                <AlertTriangle size={14} /> {summary.noGps} sin GPS
              </span>
              {summary.error > 0 && (
                <span className="inline-flex items-center gap-1 text-danger">
                  <AlertTriangle size={14} /> {summary.error} con error
                </span>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border px-5 py-3.5">
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="inline-flex h-[38px] items-center rounded-control border border-border-strong bg-surface px-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-surface-3 disabled:opacity-40"
          >
            {complete ? "Cerrar" : "Cancelar"}
          </button>
          {!complete && (
            <button
              type="button"
              onClick={startUpload}
              disabled={!hasPending || busy}
              className="inline-flex h-[38px] items-center gap-2 rounded-control bg-primary px-4 text-[13.5px] font-semibold text-primary-fg shadow-[0_1px_2px_rgba(45,98,230,.35)] transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />
              {busy ? "Subiendo…" : `Subir ${items.filter((i) => i.phase === "pending").length || ""}`.trim()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
