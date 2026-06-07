"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Copy, Check } from "@/components/ui/Icons";

/** Copy-to-clipboard box used for both the token and the iframe snippet. */
export function CopyBox({
  value,
  mono = true,
  multiline = false,
  label,
}: {
  value: string;
  mono?: boolean;
  multiline?: boolean;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      {label && <div className="mb-1.5 text-[12.5px] font-medium text-ink-soft">{label}</div>}
      <div
        className={cn(
          "flex gap-2 rounded-control border border-border-strong bg-surface-2 p-2.5",
          multiline ? "items-start" : "items-center",
        )}
      >
        <code
          className={cn(
            "min-w-0 flex-1 break-all text-[12.5px] text-ink-soft",
            mono && "font-mono",
            multiline ? "whitespace-pre-wrap leading-relaxed" : "truncate",
          )}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex h-8 flex-none items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-medium transition-colors",
            copied
              ? "border-transparent bg-success-soft text-success"
              : "border-border-strong bg-surface text-ink-soft hover:bg-surface-3",
          )}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
