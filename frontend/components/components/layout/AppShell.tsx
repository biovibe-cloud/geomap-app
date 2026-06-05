import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * AppShell — the authenticated chrome: left rail + top bar + scrollable
 * content area. Wrap page content with it from a route-group layout, e.g.
 * `app/(app)/layout.tsx`.
 *
 * The content area is the only scroll region; pages render straight into it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto px-[30px] pb-[30px] pt-[26px]">
          {children}
        </main>
      </div>
    </div>
  );
}
