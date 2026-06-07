"use client";

import { useEffect } from "react";
import { AlertTriangle } from "@/components/ui/Icons";

/** Confirmation modal for revoking public access. */
export function RevokeModal({
  open,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Revocar acceso"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-card border border-border bg-surface p-6 shadow-pop"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.01em]">¿Revocar el acceso público?</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Revocar impide nuevos accesos al mapa inmediatamente. Las imágenes ya cargadas en
          pantallas abiertas pueden seguir visibles brevemente. El token actual dejará de
          funcionar y deberás generar uno nuevo para volver a publicar.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-[38px] items-center rounded-control border border-border-strong bg-surface px-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-surface-3 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-[38px] items-center rounded-control bg-danger px-4 text-[13.5px] font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-50"
          >
            {busy ? "Revocando…" : "Revocar acceso"}
          </button>
        </div>
      </div>
    </div>
  );
}
