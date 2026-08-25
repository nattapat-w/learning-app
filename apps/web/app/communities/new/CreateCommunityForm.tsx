"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { btnPrimary, inputBase, labelCaps, textareaBase } from "../../../lib/ui";

export function CreateCommunityForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name")),
          title: String(formData.get("title")),
          description: String(formData.get("description") || ""),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Failed to create community");
        return;
      }

      const community = await res.json();
      router.push(`/r/${community.name}`);
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
        <label htmlFor="name" className={labelCaps}>
          Name (URL)
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={21}
          pattern="[a-z0-9_]+"
          placeholder="javascript"
          className={inputBase}
        />
        <p className="mt-1 text-xs font-medium text-d-muted">r/name — lowercase only</p>
      </div>
      <div>
        <label htmlFor="title" className={labelCaps}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={100}
          className={inputBase}
        />
      </div>
      <div>
        <label htmlFor="description" className={labelCaps}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          className={textareaBase}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-d-danger">{error}</p>
      )}
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Creating…" : "Create community"}
      </button>
    </form>
  );
}
