"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CopyBox } from "./CopyBox";
import { RevokeModal } from "./RevokeModal";
import { Globe, Lock, Info, AlertTriangle } from "@/components/ui/Icons";
import type { AccessLogEntry } from "@/lib/types";

export interface EmbedPanelProps {
  mapName?: string;
  isPublic: boolean;
  /** One-time token, only present right after publishing. */
  embedToken: string | null;
  accessLog: AccessLogEntry[];
  onPublish: () => Promise<{ embed_token: string }>;
  onUnpublish: () => Promise<void>;
  /** Base origin for the iframe snippet (defaults to current origin). */
  embedOrigin?: string;
}

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-card">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
      {desc && <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Embed management panel (lives inside the AppShell). Publish toggle + one-time
 * token, always-visible iframe snippet, revoke (with confirm), and the recent
 * access log. All network actions arrive via props.
 */
export function EmbedPanel({
  
  mapName = "este mapa",
  isPublic,
  embedToken,
  accessLog,
  onPublish,
  onUnpublish,
  embedOrigin,
}: EmbedPanelProps) {
  const [published, setPublished] = useState(isPublic);
  const [token, setToken] = useState<string | null>(embedToken);
  const [busy, setBusy] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  const origin =
    embedOrigin ?? (typeof window !== "undefined" ? window.location.origin : "https://tudominio.com");

  const handlePublish = async () => {
    setBusy(true);
    try {
      const { embed_token } = await onPublish();
      setToken(embed_token);
      setPublished(true);
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    setBusy(true);
    try {
      await onUnpublish();
      setPublished(false);
      setToken(null);
      setRevokeOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const snippet = token
    ? `<iframe\n  src="${origin}/embed/${token}"\n  width="100%"\n  height="480"\n  style="border:0;border-radius:12px"\n  loading="lazy"\n></iframe>`
    : null;

  return (
    <div className="mx-auto max-w-[680px]">
      <header className="mb-6">
        <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.02em]">Compartir y embeber</h1>
        <p className="mt-1.5 text-base text-ink-muted">
          Publica <b className="font-medium text-ink-soft">{mapName}</b> para incrustarlo en cualquier
          sitio con un iframe.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {/* 1 · publish state */}
        <Card title="Estado del mapa">
          <div className="flex items-center justify-between gap-4 rounded-control border border-border bg-surface-2 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  published ? "bg-success-soft text-success" : "bg-surface-3 text-ink-muted",
                )}
              >
                {published ? <Globe size={18} /> : <Lock size={18} />}
              </span>
              <div>
                <div className="text-[14px] font-semibold">
                  {published ? "Público" : "Privado"}
                </div>
                <div className="text-[12.5px] text-ink-muted">
                  {published ? "Cualquiera con el enlace puede verlo" : "Solo tú puedes verlo"}
                </div>
              </div>
            </div>
            <Toggle on={published} busy={busy} onChange={() => (published ? setRevokeOpen(true) : handlePublish())} />
          </div>

          {/* one-time token */}
          {published && token && (
            <div className="mt-4">
              <CopyBox value={token} label="Token de acceso" />
              <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-warning">
                <AlertTriangle size={14} className="mt-px flex-none" />
                Este token no se puede recuperar. Si lo pierdes, deberás revocar y generar uno nuevo.
              </p>
            </div>
          )}
        </Card>

        {/* 2 · snippet */}
        {published && snippet && (
          <Card
            title="Código de inserción"
            desc="Pega este snippet donde quieras mostrar el mapa."
          >
            <CopyBox value={snippet} multiline />
          </Card>
        )}

        {/* 3 · revoke */}
        {published && (
          <Card
            title="Revocar acceso"
            desc="Desactiva el enlace público y anula el token actual."
          >
            <div className="flex items-start gap-2.5 rounded-control border border-border bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">
              <Info size={16} className="mt-px flex-none text-ink-muted" />
              Revocar impide nuevos accesos al mapa inmediatamente. Las imágenes ya cargadas en
              pantallas abiertas pueden seguir visibles brevemente.
            </div>
            <button
              type="button"
              onClick={() => setRevokeOpen(true)}
              className="mt-3.5 inline-flex h-[38px] items-center rounded-control border border-danger/40 bg-danger-soft px-4 text-[13.5px] font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
            >
              Revocar acceso
            </button>
          </Card>
        )}

        {/* 4 · access log */}
        {published && (
          <Card title="Accesos recientes" desc="Últimos accesos al mapa embebido. No registramos IPs.">
            {accessLog.length === 0 ? (
              <p className="rounded-control border border-dashed border-border-strong bg-surface-2 px-4 py-6 text-center text-[13px] text-ink-muted">
                Todavía no hay accesos registrados.
              </p>
            ) : (
              <div className="overflow-hidden rounded-control border border-border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-border bg-surface-2 px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-ink-muted">
                        Fecha
                      </th>
                      <th className="border-b border-border bg-surface-2 px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-ink-muted">
                        Navegador
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLog.map((row, i) => (
                      <tr key={i} className="last:[&>td]:border-0">
                        <td className="border-b border-border px-3.5 py-2.5 text-[13px] text-ink-soft">
                          {formatAccess(row.accessed_at)}
                        </td>
                        <td className="border-b border-border px-3.5 py-2.5 text-[13px] text-ink-soft">
                          {row.user_agent_short}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      <RevokeModal
        open={revokeOpen}
        busy={busy}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeOpen(false)}
      />
    </div>
  );
}

function Toggle({ on, busy, onChange }: { on: boolean; busy?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 flex-none rounded-full transition-colors disabled:opacity-50",
        on ? "bg-primary" : "bg-surface-3",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function formatAccess(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
