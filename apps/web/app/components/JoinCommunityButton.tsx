"use client";

import { useEffect, useState } from "react";
import { useJoinCommunityMutation } from "../../lib/hooks/use-api-mutations";

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
  const joinMutation = useJoinCommunityMutation(communityName);
  const [isMember, setIsMember] = useState(initialIsMember);
  const [role, setRole] = useState(initialRole);
  const [creator, setCreator] = useState(isCreator);

  useEffect(() => {
    setIsMember(initialIsMember);
    setRole(initialRole);
    setCreator(isCreator);
  }, [initialIsMember, initialRole, isCreator]);

  function join() {
    joinMutation.mutate(undefined, {
      onSuccess: () => {
        setIsMember(true);
        setRole("MEMBER");
      },
    });
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
      disabled={joinMutation.isPending}
      className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border border-d-divider bg-d-secondary px-4 text-xs font-bold text-d-header transition-colors hover:bg-[var(--background-modifier-hover)] disabled:opacity-50"
    >
      {joinMutation.isPending ? "…" : "Join"}
    </button>
  );
}
