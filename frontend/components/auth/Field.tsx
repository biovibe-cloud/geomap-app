"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eye, EyeOff } from "@/components/ui/Icons";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  /** Renders a show/hide toggle and manages text/password type. */
  reveal?: boolean;
  invalid?: boolean;
}

/** Labeled input used across the auth form. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, icon, reveal, invalid, type = "text", className, ...props }, ref) => {
    const id = useId();
    const [show, setShow] = useState(false);
    const inputType = reveal ? (show ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-soft">
          {label}
        </label>
        <div
          className={cn(
            "flex h-[44px] items-center gap-2.5 rounded-control border bg-surface px-3 transition-colors",
            "focus-within:border-primary focus-within:ring-2 focus-within:ring-[var(--ring)]",
            invalid ? "border-danger" : "border-border-strong",
          )}
        >
          {icon && <span className="flex-none text-ink-muted">{icon}</span>}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint",
              className,
            )}
            {...props}
          />
          {reveal && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShow((s) => !s)}
              className="flex-none text-ink-muted transition-colors hover:text-ink-soft"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    );
  },
);
Field.displayName = "Field";
