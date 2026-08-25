import { PostFeed } from "./PostFeed";
import type { PostPublic } from "../../lib/types";

type PostListProps = {
  posts: PostPublic[];
  emptyMessage?: string;
  defaultSort?: import("../../lib/post-sort").PostSort;
};

export function PostList({
  posts,
  emptyMessage = "No posts yet.",
  defaultSort,
}: PostListProps) {
  return (
    <PostFeed
      posts={posts}
      showCommunity
      emptyMessage={emptyMessage}
      defaultSort={defaultSort}
    />
  );
}
