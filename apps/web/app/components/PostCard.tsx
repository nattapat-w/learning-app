import Link from "next/link";
import type { PostPublic } from "../../lib/types";
import { apiAssetUrl } from "../../lib/media";
import {
  actionPill,
  feedCard,
  linkNav,
  meta,
  postTitle,
} from "../../lib/ui";
import { ProfilePic } from "./ProfilePic";
import { VoteControl } from "./VoteControl";

type PostCardProps = {
  post: PostPublic;
  showCommunity?: boolean;
  detail?: boolean;
};

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function PostCard({
  post,
  showCommunity = true,
  detail = false,
}: PostCardProps) {
  const TitleTag = detail ? "h1" : "h2";
  const imageSrc = apiAssetUrl(post.imageUrl);

  return (
    <article className={feedCard}>
      <div className={detail ? "flex" : "p-2"}>
        {detail && (
          <div className="flex w-10 shrink-0 flex-col items-center bg-d-inset py-2 px-1">
            <VoteControl
              targetType="post"
              targetId={post.id}
              initialScore={post.score}
              initialUserVote={post.userVote}
              layout="column"
            />
          </div>
        )}

        <div className={detail ? "min-w-0 flex-1 p-2" : ""}>
        <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${meta}`}>
          {showCommunity && (
            <>
              <Link
                href={`/r/${post.community.name}`}
                className={`font-bold text-d-header ${linkNav} no-underline hover:no-underline`}
              >
                r/{post.community.name}
              </Link>
              <span className="text-d-divider">•</span>
            </>
          )}
          <ProfilePic user={post.author} size="sm" />
          <Link
            href={`/u/${post.author.username}`}
            className={`${linkNav} no-underline hover:no-underline`}
          >
            u/{post.author.username}
          </Link>
          <span className="text-d-divider">•</span>
          <time dateTime={post.createdAt}>{formatRelative(post.createdAt)}</time>
        </div>

        <TitleTag className={detail ? "mt-2" : "mt-1"}>
          {detail ? (
            <span className={`${postTitle} block`}>{post.title}</span>
          ) : (
            <Link
              href={`/r/${post.community.name}/post/${post.id}`}
              className={`${postTitle} block no-underline hover:text-d-link`}
            >
              {post.title}
            </Link>
          )}
        </TitleTag>

        {imageSrc && (
          <div className={detail ? "mt-3" : "mt-2"}>
            {detail ? (
              <img
                src={imageSrc}
                alt=""
                className="max-h-[min(70vh,720px)] w-full rounded-lg border border-d-divider object-contain bg-d-inset"
              />
            ) : (
              <Link
                href={`/r/${post.community.name}/post/${post.id}`}
                className="block overflow-hidden rounded-lg border border-d-divider bg-d-inset"
              >
                <img
                  src={imageSrc}
                  alt=""
                  className="max-h-80 w-full object-contain"
                />
              </Link>
            )}
          </div>
        )}

        {post.body && (
          <div
            className={
              detail
                ? "mt-2 whitespace-pre-wrap text-sm leading-[21px] text-d-normal"
                : "mt-1 line-clamp-4 text-sm leading-[21px] text-d-normal"
            }
          >
            {post.body}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {!detail && (
            <VoteControl
              targetType="post"
              targetId={post.id}
              initialScore={post.score}
              initialUserVote={post.userVote}
              layout="horizontal"
            />
          )}
          <Link
            href={`/r/${post.community.name}/post/${post.id}`}
            className={`${actionPill} no-underline hover:no-underline`}
          >
            <span aria-hidden>💬</span>
            {post.commentCount}
          </Link>
          <span className={actionPill}>Share</span>
        </div>
        </div>
      </div>
    </article>
  );
}
