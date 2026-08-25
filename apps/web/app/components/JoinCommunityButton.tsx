"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type JoinCommunityButtonProps = {
  communityName: string;
  initialIsMember?: boolean;
  initialRole?: string | null;
  isCreator?: boolean;
};

function membershipLabel(
  isCreator?: boolean,
  role?: string | null,
): string {
  if (isCreator) return "Owner";
  if (role === "MODERATOR") return "Moderator";
  return "Joined";
}

export function JoinCommunityButton({
  communityName,
  initialIsMember = false,
  initialRole = null,
  isCreator = false,
}: JoinCommunityButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(initialIsMember);
  const [role, setRole] = useState(initialRole);
  const [creator, setCreator] = useState(isCreator);

  useEffect(() => {
    setIsMember(initialIsMember);
    setRole(initialRole);
    setCreator(isCreator);
  }, [initialIsMember, initialRole, isCreator]);

  async function join() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/communities/${encodeURIComponent(communityName)}/join`,
        { method: "POST", credentials: "include" },
      );
      if (res.ok) {
        setIsMember(true);
        setRole("MEMBER");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (isMember || creator) {
    return (
      <span className="inline-flex min-h-8 items-center rounded-full border border-d-divider bg-d-secondary-alt px-4 text-xs font-bold text-d-header">
        {membershipLabel(creator, role)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={join}
      disabled={loading}
      className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border border-d-divider bg-d-secondary px-4 text-xs font-bold text-d-header transition-colors hover:bg-[var(--background-modifier-hover)] disabled:opacity-50"
    >
      {loading ? "…" : "Join"}
    </button>
  );
}
