import { AppShell } from "@/components/layout/AppShell";

/**
 * Layout for the authenticated app routes. Everything under app/(app)/
 * renders inside the AppShell (rail + top bar + content area).
 *
 * Auth-gating (redirect to /login when the in-memory JWT is missing/expired)
 * hooks in here once AuthContext lands.
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
