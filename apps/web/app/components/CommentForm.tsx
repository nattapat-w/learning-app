"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserPublic } from "../../lib/types";
import { btnPrimary, textareaBase } from "../../lib/ui";
import { useAuth } from "./auth/auth-context";

type CommentFormProps = {
  postId: string;
  user: UserPublic | null;
  parentId?: string;
  onCancel?: () => void;
  compact?: boolean;
};

export function CommentForm({
  postId,
  user,
  parentId,
  onCancel,
  compact,
}: CommentFormProps) {
  const router = useRouter();
  const { openAuth } = useAuth();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="text-sm text-d-muted">
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="font-medium text-d-link hover:underline"
        >
          Log in
        </button>
        {" or "}
        <button
          type="button"
          onClick={() => openAuth("register")}
          className="font-medium text-d-link hover:underline"
        >
          sign up
        </button>
        {" to comment."}
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed, parentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Failed to post comment");
        return;
      }
      setBody("");
      onCancel?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={compact ? "mt-2" : ""}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment"
        rows={compact ? 3 : 4}
        className={textareaBase}
        disabled={loading}
      />
      {error && <p className="mt-2 text-sm text-d-danger">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className={`${btnPrimary} min-h-[32px] min-w-0 px-4 py-1 text-sm`}
        >
          {loading ? "Posting…" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[3px] px-3 py-1 text-sm font-medium text-d-muted hover:bg-[var(--background-modifier-hover)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
