import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { CommunityHeader } from "../../components/CommunityHeader";
import { CommunitySidebar } from "../../components/CommunitySidebar";
import { PostFeed } from "../../components/PostFeed";
import { TrackCommunityVisit } from "../../components/TrackCommunityVisit";
import { getCommunity, getCommunityPosts, getMe } from "../../../lib/api";

type CommunityPageProps = {
  params: Promise<{ name: string }>;
};

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { name } = await params;
  const community = await getCommunity(name);
  if (!community) {
    notFound();
  }

  if (name !== community.name) {
    redirect(`/r/${community.name}`);
  }

  const [posts, user] = await Promise.all([
    getCommunityPosts(community.name),
    getMe(),
  ]);

  return (
    <AppShell
      right={
        <CommunitySidebar community={community} isLoggedIn={!!user} />
      }
    >
      <TrackCommunityVisit name={community.name} title={community.title} />
      <CommunityHeader community={community} user={user} />
      <PostFeed
        posts={posts}
        showCommunity={false}
        emptyMessage="No posts in this community yet. Be the first!"
      />
    </AppShell>
  );
}
