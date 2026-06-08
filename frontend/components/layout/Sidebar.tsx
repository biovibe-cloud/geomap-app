"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PinSolid, MapIcon, Photo, Settings, Help } from "@/components/ui/Icons";

type NavItem = { href: string; label: string; icon: typeof MapIcon };

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Mapas", icon: MapIcon },
];
const SECONDARY: NavItem[] = [];

function RailButton({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-control transition-colors",
        active
          ? "bg-primary-50 text-primary"
          : "text-ink-muted hover:bg-surface-3 hover:text-ink-soft",
      )}
    >
      <Icon size={20} />
    </Link>
  );
}

/** Fixed left icon rail. */
export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="flex w-[66px] flex-none flex-col items-center border-r border-border bg-surface py-4">
      <Link
        href="/"
        aria-label="GeoMap — inicio"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-primary text-white shadow-[0_2px_6px_rgba(45,98,230,.35)]"
      >
        <PinSolid size={21} />
      </Link>

      <nav className="mt-6 flex flex-col gap-1.5">
        {PRIMARY.map((item) => (
          <RailButton key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="flex-1" />

      <nav className="flex flex-col gap-1.5">
        {SECONDARY.map((item) => (
          <RailButton key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>
    </aside>
  );
}
