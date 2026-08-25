"use client";

import { useAuth } from "./auth-context";

type LoginPromptButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export function LoginPromptButton({ className, children }: LoginPromptButtonProps) {
  const { openAuth } = useAuth();

  return (
    <button type="button" onClick={() => openAuth("login")} className={className}>
      {children}
    </button>
  );
}
