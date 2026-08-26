"use client";

import { FormEvent, useRef, useState } from "react";
import { useCreatePostMutation } from "../../../../lib/hooks/use-api-mutations";
import { btnPrimary, btnGhost, inputBase, labelCaps, textareaBase } from "../../../../lib/ui";

type SubmitPostFormProps = {
  communityName: string;
};

export function SubmitPostForm({ communityName }: SubmitPostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePostMutation(communityName);
  const [error, setError] = useState<string | null>(null);
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const post = await createPost.mutateAsync({
        title: String(formData.get("title")),
        body: String(formData.get("body") || ""),
        imageFile,
      });

      window.location.assign(`/r/${communityName}/post/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
      <button type="submit" disabled={createPost.isPending} className={btnPrimary}>
        {createPost.isPending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
