"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { UserPublic } from "../../../lib/types";
import { btnPrimary, inputBase, labelCaps, textareaBase } from "../../../lib/ui";

type ProfileFormProps = {
  user: UserPublic;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const displayName = String(formData.get("displayName"));
    const bio = String(formData.get("bio"));
    const avatarUrl = String(formData.get("avatarUrl"));

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName || undefined,
          bio: bio || undefined,
          avatarUrl: avatarUrl || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Update failed");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <div>
        <label htmlFor="displayName" className={labelCaps}>
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={50}
          defaultValue={user.displayName ?? ""}
          onChange={() => setSuccess(false)}
          className={inputBase}
        />
      </div>
      <div>
        <label htmlFor="bio" className={labelCaps}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={user.bio ?? ""}
          onChange={() => setSuccess(false)}
          className={textareaBase}
        />
      </div>
      <div>
        <label htmlFor="avatarUrl" className={labelCaps}>
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={user.avatarUrl ?? ""}
          onChange={() => setSuccess(false)}
          placeholder="https://example.com/avatar.png"
          className={inputBase}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-d-danger">{error}</p>
      )}
      {success && (
        <p className="text-sm font-medium text-d-success">Profile updated.</p>
      )}
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
