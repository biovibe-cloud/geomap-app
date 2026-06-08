"use client";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "@/components/ui/Icons";

/** Shown when loading the maps failed. */
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="mt-6 grid place-items-center rounded-card border border-dashed border-border-strong bg-surface-2 px-6 py-20 text-center">
      <div className="flex max-w-sm flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle size={28} />
        </div>
        <h2 className="mt-5 text-lg font-semibold tracking-[-0.01em]">No pudimos cargar tus mapas</h2>
        <p className="mt-2 text-base text-ink-muted">
          {message ?? "Ocurrió un error al cargar los datos."}
        </p>
        {onRetry && (
          <Button variant="default" className="mt-6" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

