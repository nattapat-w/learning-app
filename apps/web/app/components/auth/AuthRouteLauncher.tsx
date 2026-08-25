"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AuthMode } from "./auth-context";
import { useAuth } from "./auth-context";

export function AuthRouteLauncher({ mode }: { mode: AuthMode }) {
  const { openAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    openAuth(mode);
    router.replace("/");
  }, [mode, openAuth, router]);

  return null;
}
