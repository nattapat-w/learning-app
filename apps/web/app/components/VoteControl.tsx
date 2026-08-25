"use client";

import { useState } from "react";
import { useAuth } from "./auth/auth-context";

type VoteControlProps = {
  targetType: "post" | "comment";
  targetId: string;
  initialScore: number;
  initialUserVote?: number | null;
  layout?: "column" | "horizontal" | "inline";
  className?: string;
};

function formatScore(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (abs >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 4.5 4.5 10h2.75v5.25h5.5V10H17L10 4.5z" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 15.5 15.5 10h-2.75V4.75h-5.5V10H3L10 15.5z" />
    </svg>
  );
}

export function VoteControl({
  targetType,
  targetId,
  initialScore,
  initialUserVote = null,
  layout = "column",
  className = "",
}: VoteControlProps) {
  const { openAuth } = useAuth();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  async function cast(value: 1 | -1) {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/${targetType === "post" ? "posts" : "comments"}/${encodeURIComponent(targetId)}/vote`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        },
      );

      if (res.status === 401) {
        openAuth("login");
        return;
      }

      if (!res.ok) return;

      const data = (await res.json()) as { score: number; userVote: number | null };
      setScore(data.score);
      setUserVote(data.userVote);
    } finally {
      setLoading(false);
    }
  }

  const upActive = userVote === 1;
  const downActive = userVote === -1;

  const isColumn = layout === "column";
  const wrapper = isColumn
    ? "flex flex-col items-center gap-0.5"
    : layout === "horizontal"
      ? "inline-flex items-center gap-0.5 rounded-full bg-d-secondary-alt px-2 py-0.5"
      : "inline-flex items-center gap-1";

  const btn =
    "flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[var(--background-modifier-hover)] disabled:opacity-50";

  const upColor = upActive ? "text-brand" : "text-d-muted hover:text-brand";
  const downColor = downActive ? "text-d-periwinkle" : "text-d-muted hover:text-d-periwinkle";
  const scoreColor = upActive
    ? "text-brand"
    : downActive
      ? "text-d-periwinkle"
      : "text-d-header";

  return (
    <div className={`${wrapper} ${className}`}>
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={upActive}
        disabled={loading}
        onClick={() => cast(1)}
        className={`${btn} ${upColor}`}
      >
        <ChevronUp />
      </button>
      <span className={`min-w-[2ch] px-1 text-center text-xs font-bold tabular-nums ${scoreColor}`}>
        {formatScore(score)}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={downActive}
        disabled={loading}
        onClick={() => cast(-1)}
        className={`${btn} ${downColor}`}
      >
        <ChevronDown />
      </button>
    </div>
  );
}
