"use client";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Search } from "@/components/ui/Icons";

export function Header({ userName = "Rubén Arcila" }: { userName?: string }) {
  return (
    <header className="flex h-[62px] flex-none items-center gap-[18px] border-b border-border bg-surface px-[22px]">
      <Link href="/dashboard" className="text-[18px] font-semibold tracking-[-0.02em]">
        Geo<span className="text-primary">Map</span>
      </Link>
      <label className="flex h-[38px] max-w-[480px] flex-1 items-center gap-2.5 rounded-control bg-surface-3 px-3 text-ink-muted">
        <Search size={17} />
        <input
          type="search"
          placeholder="Buscar mapas…"
          className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
        />
      </label>
      <div className="ml-auto flex items-center gap-3">
        <Avatar name={userName} />
      </div>
    </header>
  );
}