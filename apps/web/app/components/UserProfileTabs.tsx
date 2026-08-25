"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  CommentWithPostPublic,
  UserCommunityPublic,
  UserPostSummary,
} from "../../lib/types";
import { apiAssetUrl } from "../../lib/media";
import { contentCard, meta } from "../../lib/ui";

type Tab = "posts" | "comments" | "communities";

type UserProfileTabsProps = {
  posts: UserPostSummary[];
  comments: CommentWithPostPublic[];
  communities: UserCommunityPublic[];
};

export function UserProfileTabs({
  posts,
  comments,
  communities,
}: UserProfileTabsProps) {
  const [tab, setTab] = useState<Tab>("posts");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "posts", label: "Posts", count: posts.length },
    { id: "comments", label: "Comments", count: comments.length },
    { id: "communities", label: "Communities", count: communities.length },
  ];

  return (
    <div className="mt-6">
      <div className="flex gap-1 border-b border-d-divider">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.id
                ? "border-b-2 border-brand text-d-header"
                : "text-d-muted hover:text-d-normal"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {tab === "posts" && posts.length === 0 && (
          <p className="text-sm text-d-muted">No posts yet.</p>
        )}
        {tab === "posts" &&
          posts.map((post) => {
            const imageSrc = apiAssetUrl(post.imageUrl);
            return (
            <Link
              key={post.id}
              href={`/r/${post.community.name}/post/${post.id}`}
              className={`${contentCard} flex gap-3 p-3 no-underline hover:no-underline hover:border-d-muted`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-d-header">{post.title}</p>
                <p className={meta}>
                  r/{post.community.name} · {post.score} points ·{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded border border-d-divider object-cover bg-d-inset"
                />
              )}
            </Link>
            );
          })}

        {tab === "comments" && comments.length === 0 && (
          <p className="text-sm text-d-muted">No comments yet.</p>
        )}
        {tab === "comments" &&
          comments.map((comment) => (
            <Link
              key={comment.id}
              href={`/r/${comment.post.community.name}/post/${comment.post.id}`}
              className={`${contentCard} block p-3 no-underline hover:no-underline hover:border-d-muted`}
            >
              <p className="text-sm text-d-normal line-clamp-3">{comment.body}</p>
              <p className={`mt-1 ${meta}`}>
                on &ldquo;{comment.post.title}&rdquo; in r/
                {comment.post.community.name} · {comment.score} points
              </p>
            </Link>
          ))}

        {tab === "communities" && communities.length === 0 && (
          <p className="text-sm text-d-muted">No joined communities.</p>
        )}
        {tab === "communities" &&
          communities.map((c) => (
            <Link
              key={c.id}
              href={`/r/${c.name}`}
              className={`${contentCard} flex items-center justify-between gap-3 p-3 no-underline hover:no-underline hover:border-d-muted`}
            >
              <div>
                <p className="text-sm font-bold text-d-header">r/{c.name}</p>
                <p className={meta}>{c.title}</p>
              </div>
              <span className={meta}>
                {c.isCreator
                  ? "Owner"
                  : c.role === "MODERATOR"
                    ? "Moderator"
                    : "Member"} · joined{" "}
                {new Date(c.joinedAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
