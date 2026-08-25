import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { ProfilePic } from "../../components/ProfilePic";
import { UserProfileTabs } from "../../components/UserProfileTabs";
import {
  getUser,
  getUserComments,
  getUserCommunities,
  getUserPosts,
} from "../../../lib/api";
import { contentCard, display, meta } from "../../../lib/ui";

type UserPageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    notFound();
  }

  const [posts, comments, communities] = await Promise.all([
    getUserPosts(user.username),
    getUserComments(user.username),
    getUserCommunities(user.username),
  ]);

  const joined = new Date(user.createdAt).toLocaleDateString();

  return (
    <AppShell>
      <div className={`${contentCard} flex items-start gap-4`}>
        <ProfilePic user={user} size="lg" />
        <div>
          <h1 className={display}>{user.displayName ?? user.username}</h1>
          <p className="text-sm font-medium text-d-muted">u/{user.username}</p>
          <p className={`mt-1 ${meta}`}>Joined {joined}</p>
        </div>
      </div>
      {user.bio && (
        <p className="mt-4 max-w-2xl text-base font-normal leading-[22px] text-d-normal">
          {user.bio}
        </p>
      )}

      <UserProfileTabs
        posts={posts}
        comments={comments}
        communities={communities}
      />
    </AppShell>
  );
}
