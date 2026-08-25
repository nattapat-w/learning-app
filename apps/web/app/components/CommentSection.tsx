import { getMe } from "../../lib/api";
import type { CommentPublic } from "../../lib/types";
import { card } from "../../lib/ui";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

type CommentSectionProps = {
  postId: string;
  comments: CommentPublic[];
  commentCount: number;
};

export async function CommentSection({
  postId,
  comments,
  commentCount,
}: CommentSectionProps) {
  const user = await getMe();

  return (
    <section className={`mt-6 p-5 sm:p-6 ${card}`}>
      <h2 className="text-sm font-semibold text-d-header">
        {commentCount} Comment{commentCount === 1 ? "" : "s"}
      </h2>
      <div className="mt-4">
        <CommentForm postId={postId} user={user} />
      </div>
      <CommentList comments={comments} postId={postId} user={user} />
    </section>
  );
}
