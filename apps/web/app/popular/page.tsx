import { AppShell } from "../components/AppShell";
import { HomeRightSidebar } from "../components/HomeRightSidebar";
import { PostList } from "../components/PostList";
import { getPosts } from "../../lib/api";

export default async function PopularPage() {
  const posts = await getPosts(25, "popular", "hot");

  return (
    <AppShell right={<HomeRightSidebar />}>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-d-header">Popular</h1>
        <p className="mt-1 text-sm text-d-muted">
          Trending posts across Reddit.
        </p>
      </div>

      <PostList
        posts={posts}
        defaultSort="hot"
        emptyMessage="No popular posts yet."
      />
    </AppShell>
  );
}
