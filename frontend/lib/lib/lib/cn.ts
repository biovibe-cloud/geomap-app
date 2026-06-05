/** Tiny class-name joiner (no deps). Swap for clsx + tailwind-merge if needed. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
