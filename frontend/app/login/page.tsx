"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/components/auth/LoginPage";

export default function LoginRoute() {
  const router = useRouter();
  return (
    <LoginPage
      onAuthenticated={() => router.push("/dashboard")}
    />
  );
}