"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, sessionExpired } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (!token || sessionExpired) {
      if (!redirected.current) {
        redirected.current = true;
        router.push("/login");
      }
    }
  }, [token, sessionExpired, router]);

  if (!token) return null;

  return <AppShell>{children}</AppShell>;
}