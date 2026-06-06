"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { Field } from "./Field";
import { PinSolid, Mail, Lock, Spinner, AlertTriangle, Info } from "@/components/ui/Icons";

type Tab = "login" | "register";

export interface LoginPageProps {
  onAuthenticated?: () => void;
  defaultTab?: Tab;
}

export function LoginPage({ onAuthenticated, defaultTab = "login" }: LoginPageProps) {
  const { login, register, loading, error, sessionExpired, clearError } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setLocalError(null);
    setRegistered(false);
    clearError();
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (tab === "register" && password !== confirm) {
      setLocalError("Las contraseñas no coinciden.");
      return;
    }

    try {
      if (tab === "login") {
        await login(email, password);
        onAuthenticated?.();
      } else {
        await register(email, password);
        setRegistered(true);
      }
    } catch {
      /* error surfaced via context `error` */
    }
  }

  const shownError = localError ?? error;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-primary text-white shadow-[0_4px_14px_rgba(45,98,230,.4)]">
            <PinSolid size={28} />
          </div>
          <h1 className="mt-3.5 text-[22px] font-semibold tracking-[-0.02em]">
            Mapeo <span className="text-primary">Fotográfico</span>
          </h1>
          <p className="mt-1 text-base text-ink-muted">
            Tus fotos, ubicadas en el mapa.
          </p>
        </div>

        {sessionExpired && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-control border border-warning/30 bg-warning-soft px-3.5 py-3 text-[13px] text-warning"
          >
            <Info size={17} className="mt-px flex-none" />
            <span>Tu sesión expiró por seguridad. Vuelve a iniciar sesión para continuar.</span>
          </div>
        )}

        {registered ? (
          <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card text-center">
            <div className="text-[15px] font-semibold text-ink mb-2">¡Cuenta creada!</div>
            <p className="text-base text-ink-muted mb-4">
              Revisa tu email y confirma tu cuenta antes de iniciar sesión.
            </p>
            <button
              onClick={() => { setRegistered(false); switchTab("login"); }}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card">
            <div
              role="tablist"
              aria-label="Autenticación"
              className="grid grid-cols-2 gap-1 rounded-control bg-surface-3 p-1"
            >
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => switchTab(t)}
                  className={cn(
                    "h-9 rounded-[7px] text-[13.5px] font-medium transition-colors",
                    tab === t
                      ? "bg-surface text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink-soft",
                  )}
                >
                  {t === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Field
                label="Contraseña"
                reveal
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {tab === "register" && (
                <Field
                  label="Confirmar contraseña"
                  reveal
                  autoComplete="new-password"
                  placeholder="••••••••"
                  icon={<Lock size={18} />}
                  value={confirm}
                  invalid={!!confirm && confirm !== password}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              )}

              {shownError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-control border border-danger/25 bg-danger-soft px-3 py-2.5 text-[13px] text-danger"
                >
                  <AlertTriangle size={16} className="mt-px flex-none" />
                  <span>{shownError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-1 inline-flex h-[44px] items-center justify-center gap-2 rounded-control bg-primary px-4",
                  "text-[14.5px] font-semibold text-primary-fg shadow-[0_1px_2px_rgba(45,98,230,.35)] transition-colors",
                  "hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  "disabled:cursor-not-allowed disabled:opacity-70",
                )}
              >
                {loading && <Spinner size={18} />}
                {loading
                  ? tab === "login" ? "Iniciando sesión…" : "Creando cuenta…"
                  : tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            {tab === "login" && (
              <button
                type="button"
                className="mx-auto mt-4 block text-[13px] font-medium text-ink-muted transition-colors hover:text-primary"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        )}

        <p className="mt-5 text-center text-[12.5px] leading-relaxed text-ink-muted">
          {tab === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button onClick={() => switchTab("register")} className="font-medium text-primary hover:underline">
                Crea una
              </button>
            </>
          ) : (
            <>Al crear una cuenta aceptas nuestros Términos y la Política de privacidad.</>
          )}
        </p>
      </div>
    </main>
  );
}