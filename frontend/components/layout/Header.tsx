"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Help, Upload, Plus } from "@/components/ui/Icons";

export interface HeaderProps {
  userName?: string;
  onUpload?: () => void;
  onNewMap?: () => void;
}

/** Top application bar: brand · search · primary actions · avatar. */
export function Header({ userName = "Rubén Arcila", onUpload, onNewMap }: HeaderProps) {
  return (
    <header className="flex h-[62px] flex-none items-center gap-[18px] border-b border-border bg-surface px-[22px]">
      <Link href="/" className="text-[18px] font-semibold tracking-[-0.02em]">
        Geo<span className="text-primary">Map</span>
      </Link>

      <label className="flex h-[38px] max-w-[480px] flex-1 items-center gap-2.5 rounded-control bg-surface-3 px-3 text-ink-muted">
        <Search size={17} />
        <input
          type="search"
          placeholder="Buscar mapas, lotes o lugares…"
          className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
        />
        <kbd className="rounded-[5px] border border-border bg-surface px-1.5 py-px font-mono text-[11px] text-ink-muted">
          ⌘K
        </kbd>
      </label>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="icon" aria-label="Ayuda">
          <Help size={18} />
        </Button>
        <Button variant="default" onClick={onUpload}>
          <Upload size={17} />
          Subir fotos
        </Button>
        <Button variant="primary" onClick={onNewMap}>
          <Plus size={17} />
          Nuevo mapa
        </Button>
        <Avatar name={userName} />
      </div>
    </header>
  );
}
