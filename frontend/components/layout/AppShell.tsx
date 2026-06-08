"use client";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ShellProvider, useShell } from "@/contexts/ShellContext";

function AppShellInner({ children }: { children: ReactNode }) {
  const { onUpload, onNewMap } = useShell();
  return (
    <div className="flex h-dvh w-full bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onUpload={onUpload} onNewMap={onNewMap} />
        <main className="min-h-0 flex-1 overflow-y-auto px-[30px] pb-[30px] pt-[26px]">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <AppShellInner>{children}</AppShellInner>
    </ShellProvider>
  );
}