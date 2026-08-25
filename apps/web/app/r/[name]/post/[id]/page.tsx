import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "../../../../components/AppShell";
import { CommentSection } from "../../../../components/CommentSection";
import { CommunitySidebar } from "../../../../components/CommunitySidebar";
import { PostDetail } from "../../../../components/PostDetail";
import {
  getCommunity,
  getMe,
  getPost,
  getPostComments,
} from "../../../../../lib/api";
import { linkNav } from "../../../../../lib/ui";

type PostPageProps = {
  params: Promise<{ name: string; id: string }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { name, id } = await params;
  const post = await getPost(id);

  if (
    !post ||
    post.community.name.toLowerCase() !== name.toLowerCase()
  ) {
    notFound();
  }

  if (name !== post.community.name) {
    redirect(`/r/${post.community.name}/post/${id}`);
  }

  const [comments, community, user] = await Promise.all([
    getPostComments(id),
    getCommunity(post.community.name),
    getMe(),
  ]);

  if (!community) {
    notFound();
  }

  return (
    <AppShell
      right={<CommunitySidebar community={community} isLoggedIn={!!user} />}
    >
      <Link
        href={`/r/${post.community.name}`}
        className={`mb-4 inline-flex items-center gap-1 text-sm font-medium ${linkNav} no-underline hover:no-underline`}
      >
        ← Back to r/{post.community.name}
      </Link>

      <PostDetail post={post} />
      <CommentSection
        postId={post.id}
        comments={comments}
        commentCount={post.commentCount}
      />
    </AppShell>
  );
}
