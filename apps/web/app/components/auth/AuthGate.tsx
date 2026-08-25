"use client";

import type { ReactNode } from "react";
import type { UserPublic } from "../../../lib/types";
import { btnPrimary, btnSecondary, contentCard, heading } from "../../../lib/ui";
import { useAuth } from "./auth-context";

type AuthGateProps = {
  user: UserPublic | null;
  title: string;
  children: ReactNode;
};

export function AuthGate({ user, title, children }: AuthGateProps) {
  const { openAuth } = useAuth();

  if (user) {
    return children;
  }

  return (
    <div className={contentCard}>
      <h1 className={`mb-2 ${heading}`}>{title}</h1>
      <p className="mb-6 text-sm text-d-muted">
        Log in or sign up to continue.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => openAuth("login")} className={btnPrimary}>
          Log in
        </button>
        <button type="button" onClick={() => openAuth("register")} className={btnSecondary}>
          Sign up
        </button>
      </div>
    </div>
  );
}
