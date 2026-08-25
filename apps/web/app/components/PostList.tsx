import { PostFeed } from "./PostFeed";
import type { PostPublic } from "../../lib/types";

type PostListProps = {
  posts: PostPublic[];
  emptyMessage?: string;
};

export function PostList({
  posts,
  emptyMessage = "No posts yet.",
}: PostListProps) {
  return (
    <PostFeed
      posts={posts}
      showCommunity
      emptyMessage={emptyMessage}
      showSort={false}
    />
  );
}
