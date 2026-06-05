import { cn } from "@/lib/cn";

/** User avatar — initials fallback. Pass `src` to show a photo. */
export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface shadow-sm",
        "bg-gradient-to-br from-primary to-accent text-[12.5px] font-semibold text-white",
        className,
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
