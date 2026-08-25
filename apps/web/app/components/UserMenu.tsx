"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UserPublic } from "../../lib/types";
import { btnGhost, btnPrimary, linkNav } from "../../lib/ui";
import { useAuth } from "./auth/auth-context";
import { ProfilePic } from "./ProfilePic";

type UserMenuProps = {
  user: UserPublic;
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors duration-[170ms] ease-in-out hover:bg-[var(--background-modifier-hover)]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <ProfilePic user={user} size="sm" />
        <span className="hidden text-sm font-medium text-d-header sm:inline">
          {user.displayName ?? user.username}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded border border-d-divider bg-d-secondary py-1 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          <div className="border-b border-d-divider px-3 py-2">
            <p className="text-sm font-semibold text-d-header truncate">
              {user.displayName ?? user.username}
            </p>
            <p className="text-xs text-d-muted truncate">u/{user.username}</p>
          </div>
          <Link
            href={`/u/${user.username}`}
            role="menuitem"
            className={`block px-3 py-2 text-sm ${linkNav} no-underline hover:no-underline hover:bg-[var(--background-modifier-hover)]`}
            onClick={() => setOpen(false)}
          >
            View profile
          </Link>
          <Link
            href="/settings/profile"
            role="menuitem"
            className={`block px-3 py-2 text-sm ${linkNav} no-underline hover:no-underline hover:bg-[var(--background-modifier-hover)]`}
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <div className="my-1 h-px bg-d-divider" />
          <button
            type="button"
            role="menuitem"
            className={`${btnGhost} w-full justify-start px-3 py-2 text-left text-sm text-d-normal`}
            onClick={logout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function GuestNav() {
  const { openAuth } = useAuth();
  return (
    <>
      <button type="button" onClick={() => openAuth("login")} className={btnGhost}>
        Log in
      </button>
      <button type="button" onClick={() => openAuth("register")} className={btnPrimary}>
        Sign up
      </button>
    </>
  );
}
