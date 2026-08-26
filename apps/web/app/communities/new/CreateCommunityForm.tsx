"use client";

import { FormEvent, useState } from "react";
import { useCreateCommunityMutation } from "../../../lib/hooks/use-api-mutations";
import { btnPrimary, inputBase, labelCaps, textareaBase } from "../../../lib/ui";

export function CreateCommunityForm() {
  const createCommunity = useCreateCommunityMutation();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createCommunity.mutateAsync({
        name: String(formData.get("name")),
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create community");
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
      <button type="submit" disabled={createCommunity.isPending} className={btnPrimary}>
        {createCommunity.isPending ? "Creating…" : "Create community"}
      </button>
    </form>
  );
}
