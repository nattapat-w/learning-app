"use client";

import { FormEvent, useRef, useState } from "react";
import { btnPrimary, btnGhost, inputBase, labelCaps, textareaBase } from "../../../../lib/ui";

type SubmitPostFormProps = {
  communityName: string;
};

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join(", ");
  } catch {
    /* ignore */
  }
  return fallback;
}

export function SubmitPostForm({ communityName }: SubmitPostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function onPickImage(file: File | null) {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError("Only JPEG, PNG, GIF, and WebP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller");
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    onPickImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads/image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, "Failed to upload image"));
    }

    const data = (await res.json()) as { url: string };
    if (!data.url?.startsWith("/uploads/")) {
      throw new Error("Invalid upload response from server");
    }
    return data.url;
  }

  function goToPost(postId: string) {
    window.location.assign(`/r/${communityName}/post/${postId}`);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityName,
          title: String(formData.get("title")),
          body: String(formData.get("body") || ""),
          imageUrl,
        }),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res, "Failed to create post"));
        return;
      }

      const post = (await res.json()) as { id?: string };
      if (!post.id) {
        setError("Post created but server returned no id. Check the community feed.");
        return;
      }

      goToPost(post.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      if (msg === "Failed to fetch" || msg === "Network error") {
        setError(
          "Connection timed out or failed (common on Render cold start). Check r/" +
            communityName +
            " — your post may still have been created.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      <div>
        <label htmlFor="title" className={labelCaps}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={300}
          className={inputBase}
        />
      </div>

      <div>
        <span className={labelCaps}>Image (optional)</span>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className={btnGhost}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose image
          </button>
          {imageFile && (
            <button type="button" className={btnGhost} onClick={clearImage}>
              Remove
            </button>
          )}
          {imageFile && (
            <span className="text-sm text-d-muted">{imageFile.name}</span>
          )}
        </div>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-3 max-h-80 w-full rounded-lg border border-d-divider object-contain bg-d-inset"
          />
        )}
      </div>

      <div>
        <label htmlFor="body" className={labelCaps}>
          Body (optional)
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          maxLength={40000}
          className={textareaBase}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-d-danger">{error}</p>
      )}
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
