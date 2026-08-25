import { AppShell } from "./components/AppShell";
import { HomeRightSidebar } from "./components/HomeRightSidebar";
import { PostList } from "./components/PostList";
import { getPosts } from "../lib/api";

export default async function Home() {
  const posts = await getPosts(25);

  return (
    <AppShell right={<HomeRightSidebar />}>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-d-header">Home</h1>
      </div>

      <PostList
        posts={posts}
        emptyMessage="No posts yet. Create a community and share something."
      />
    </AppShell>
  );
}
