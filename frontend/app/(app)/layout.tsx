"use client";

import { useEffect, useState } from "react";
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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
    if (!token || sessionExpired) {
      router.push("/login");
    }
  }, [token, sessionExpired, router]);

  if (!checked) return null;
  if (!token) return null;

  return <AppShell>{children}</AppShell>;
}
