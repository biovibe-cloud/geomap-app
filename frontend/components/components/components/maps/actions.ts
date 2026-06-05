import type { MapSummary } from "@/lib/types";

/** Row/card action callbacks, threaded from the page down to each item. */
export interface MapActions {
  onOpen?: (map: MapSummary) => void;
  onManageEmbed?: (map: MapSummary) => void;
  onDelete?: (map: MapSummary) => void;
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "12 may 2024" from an ISO date. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es-ES");
}
