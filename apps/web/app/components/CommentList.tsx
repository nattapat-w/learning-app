"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommentPublic, UserPublic } from "../../lib/types";
import { linkNav, meta } from "../../lib/ui";
import { CommentForm } from "./CommentForm";
import { ProfilePic } from "./ProfilePic";
import { VoteControl } from "./VoteControl";

type CommentListProps = {
  comments: CommentPublic[];
  postId: string;
  user: UserPublic | null;
};

function CommentNode({
  comment,
  byParent,
  postId,
  user,
  depth,
}: {
  comment: CommentPublic;
  byParent: Map<string, CommentPublic[]>;
  postId: string;
  user: UserPublic | null;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const replies = byParent.get(comment.id) ?? [];

  return (
    <div className={depth > 0 ? "mt-3 border-l-2 border-d-divider pl-4 hover:border-d-link" : "mt-4"}>
      <div className="flex gap-3">
        <ProfilePic user={comment.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className={`flex flex-wrap items-center gap-x-1.5 ${meta}`}>
            <Link
              href={`/u/${comment.author.username}`}
              className={`font-semibold text-d-header ${linkNav} no-underline hover:no-underline`}
            >
              {comment.author.displayName ?? comment.author.username}
            </Link>
            <time dateTime={comment.createdAt}>
              {new Date(comment.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="mt-1 text-sm leading-[22px] text-d-normal whitespace-pre-wrap">
            {comment.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <VoteControl
              targetType="comment"
              targetId={comment.id}
              initialScore={comment.score}
              initialUserVote={comment.userVote}
              layout="inline"
            />
            {user && depth < 4 && (
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                className="text-xs font-semibold text-d-muted hover:text-d-normal"
              >
                Reply
              </button>
            )}
          </div>
          {replying && (
            <CommentForm
              postId={postId}
              user={user}
              parentId={comment.id}
              compact
              onCancel={() => setReplying(false)}
            />
          )}
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              byParent={byParent}
              postId={postId}
              user={user}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommentList({ comments, postId, user }: CommentListProps) {
  const topLevel = comments.filter((c) => !c.parentId);
  const byParent = new Map<string, CommentPublic[]>();

  for (const c of comments) {
    if (c.parentId) {
      const list = byParent.get(c.parentId) ?? [];
      list.push(c);
      byParent.set(c.parentId, list);
    }
  }

  if (topLevel.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-d-muted">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <div>
      {topLevel.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          byParent={byParent}
          postId={postId}
          user={user}
          depth={0}
        />
      ))}
    </div>
  );
}
