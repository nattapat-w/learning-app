import { getCommunities, getJoinedCommunities, getMe } from "../../lib/api";
import { LeftSidebarNav } from "./LeftSidebarNav";

export async function LeftSidebar() {
  const user = await getMe();
  const communities = user
    ? await getJoinedCommunities()
    : await getCommunities();

  return (
    <LeftSidebarNav
      communities={communities}
      communitiesLabel={user ? "Your communities" : "Communities"}
    />
  );
}
