export type PostSort = "best" | "hot" | "new" | "top" | "rising";

export const SORT_OPTIONS: { value: PostSort; label: string }[] = [
  { value: "best", label: "Best" },
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
  { value: "rising", label: "Rising" },
];

function hoursSince(date: string): number {
  return Math.max(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60),
    0.5,
  );
}

export function sortPosts<T extends {
  score: number;
  commentCount: number;
  createdAt: string;
}>(posts: T[], sort: PostSort): T[] {
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
          (a.score + a.commentCount * 2) / hoursSince(a.createdAt);
        const riseB =
          (b.score + b.commentCount * 2) / hoursSince(b.createdAt);
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
