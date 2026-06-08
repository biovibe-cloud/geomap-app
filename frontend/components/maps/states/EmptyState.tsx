"use client";
import { Button } from "@/components/ui/Button";
import { MapPlus, Plus } from "@/components/ui/Icons";

/** Shown when the user has no maps yet (ready + empty). */
export function EmptyState({ onCreateMap }: { onCreateMap?: () => void }) {
  return (
    <div className="mt-6 grid place-items-center rounded-card border border-dashed border-border-strong bg-surface-2 px-6 py-20 text-center">
      <div className="flex max-w-sm flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          <MapPlus size={30} />
        </div>
        <h2 className="mt-5 text-lg font-semibold tracking-[-0.01em]">Crea tu primer mapa</h2>
        <p className="mt-2 text-base text-ink-muted">
          Sube fotos con ubicación y GeoMap las colocará automáticamente en un mapa
          interactivo que podrás compartir o embeber.
        </p>
        <Button variant="primary" className="mt-6" onClick={onCreateMap}>
          <Plus size={17} /> Nuevo mapa
        </Button>
      </div>
    </div>
  );
}

