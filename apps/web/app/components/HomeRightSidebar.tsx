import Link from "next/link";
import { getCommunities } from "../../lib/api";
import { card, meta, stickyBelowHeader } from "../../lib/ui";
import { CommunityIcon } from "./CommunityHeader";

export async function HomeRightSidebar() {
  const communities = await getCommunities();
  const recent = communities.slice(0, 6);

  return (
    <aside className={`${stickyBelowHeader} space-y-3`}>
      {recent.length > 0 && (
        <div className={`p-4 ${card}`}>
          <h2 className="text-sm font-bold text-d-header">Recently visited</h2>
          <ul className="mt-3 space-y-1">
            {recent.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/r/${c.name}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-d-normal no-underline transition-colors hover:bg-[var(--background-modifier-hover)] hover:no-underline"
                >
                  <CommunityIcon name={c.name} size="sm" />
                  <span className="truncate">r/{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`mt-4 p-4 ${card}`}>
        <h2 className="text-sm font-bold text-d-header">Explore</h2>
        <p className="mt-2 text-sm leading-relaxed text-d-muted">
          Browse communities from the left sidebar or create your own.
        </p>
        <Link
          href="/communities/new"
          className="mt-3 inline-block text-sm font-semibold text-d-link no-underline hover:underline"
        >
          Create a community
        </Link>
      </div>

      <p className={`mt-6 px-2 ${meta}`}>Reddit-clone · learning project</p>
    </aside>
  );
}
