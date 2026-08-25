import type { PostPublic } from "../common/types/post-public";

export type PostSort = "best" | "hot" | "new" | "top" | "rising";

export const POST_SORTS: PostSort[] = ["best", "hot", "new", "top", "rising"];

export function isPostSort(value: string): value is PostSort {
  return POST_SORTS.includes(value as PostSort);
}

function hoursSince(date: Date): number {
  return Math.max((Date.now() - date.getTime()) / (1000 * 60 * 60), 0.5);
}

export function sortPosts(posts: PostPublic[], sort: PostSort): PostPublic[] {
  const copy = [...posts];
  switch (sort) {
    case "new":
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "top":
      return copy.sort((a, b) => b.score - a.score);
    case "hot":
      return copy.sort((a, b) => {
        const hotA = b.score + b.commentCount * 2;
        const hotB = a.score + a.commentCount * 2;
        return hotA - hotB;
      });
    case "rising":
      return copy.sort((a, b) => {
        const riseA =
          (a.score + a.commentCount * 2) / hoursSince(new Date(a.createdAt));
        const riseB =
          (b.score + b.commentCount * 2) / hoursSince(new Date(b.createdAt));
        return riseB - riseA;
      });
    default:
      return copy.sort((a, b) => {
        const bestA = b.score + b.commentCount;
        const bestB = a.score + a.commentCount;
        return bestA - bestB;
      });
  }
}
