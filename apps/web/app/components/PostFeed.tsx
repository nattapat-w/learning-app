"use client";

import { useMemo, useState } from "react";
import type { PostPublic } from "../../lib/types";
import { sortPosts, type PostSort } from "../../lib/post-sort";
import { feedSortBar } from "../../lib/ui";
import { PostCard } from "./PostCard";
import { SortDropdown } from "./SortDropdown";

type PostFeedProps = {
  posts: PostPublic[];
  showCommunity?: boolean;
  emptyMessage?: string;
  defaultSort?: PostSort;
  showSort?: boolean;
};

export function PostFeed({
  posts,
  showCommunity = true,
  emptyMessage = "No posts yet.",
  defaultSort = "best",
  showSort = true,
}: PostFeedProps) {
  const [sort, setSort] = useState<PostSort>(defaultSort);

  const sorted = useMemo(
    () => (showSort ? sortPosts(posts, sort) : posts),
    [posts, sort, showSort],
  );

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-d-divider bg-d-secondary p-10 text-center text-sm font-medium text-d-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {showSort && (
        <div className={feedSortBar}>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      )}
      <ul className="space-y-[10px]">
        {sorted.map((post) => (
          <li key={post.id}>
            <PostCard post={post} showCommunity={showCommunity} />
          </li>
        ))}
      </ul>
    </div>
  );
}
