"use client";

import { useState } from "react";
import { useCreateCommentMutation } from "../../lib/hooks/use-api-mutations";
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
  const { openAuth } = useAuth();
  const createComment = useCreateCommentMutation(postId);
  const [body, setBody] = useState("");
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

    setError(null);
    try {
      await createComment.mutateAsync({
        body: trimmed,
        parentId,
      });
      setBody("");
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
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
        disabled={createComment.isPending}
      />
      {error && <p className="mt-2 text-sm text-d-danger">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={createComment.isPending || !body.trim()}
          className={`${btnPrimary} min-h-[32px] min-w-0 px-4 py-1 text-sm`}
        >
          {createComment.isPending ? "Posting…" : "Comment"}
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
