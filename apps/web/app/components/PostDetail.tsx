import type { PostPublic } from "../../lib/types";
import { PostCard } from "./PostCard";

type PostDetailProps = {
  post: PostPublic;
};

export function PostDetail({ post }: PostDetailProps) {
  return <PostCard post={post} showCommunity={true} detail />;
}
