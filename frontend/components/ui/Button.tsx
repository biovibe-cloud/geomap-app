"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "default" | "ghost" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-fg border-transparent shadow-[0_1px_2px_rgba(45,98,230,.35)] hover:bg-primary-strong",
  default:
    "bg-surface text-ink-soft border-border-strong hover:bg-surface-3",
  ghost:
    "bg-transparent text-ink-muted border-transparent hover:bg-surface-3 hover:text-ink-soft px-2.5",
  icon:
    "bg-surface text-ink-muted border-border-strong hover:bg-surface-3 hover:text-ink-soft w-[38px] px-0 justify-center",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-[38px] items-center justify-center gap-2 rounded-control border px-[15px]",
        "text-base font-medium leading-none transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

