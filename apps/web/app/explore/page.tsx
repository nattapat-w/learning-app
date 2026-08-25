import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { HomeRightSidebar } from "../components/HomeRightSidebar";
import { getCommunities } from "../../lib/api";
import { navItem } from "../../lib/ui";

export default async function ExplorePage() {
  const communities = await getCommunities();

  return (
    <AppShell right={<HomeRightSidebar />}>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-d-header">Explore</h1>
        <p className="mt-1 text-sm text-d-muted">
          All communities on the platform.
        </p>
      </div>

      {communities.length === 0 ? (
        <p className="rounded-lg border border-dashed border-d-divider bg-d-secondary p-10 text-center text-sm font-medium text-d-muted">
          No communities yet.{" "}
          <Link href="/communities/new" className="text-d-link hover:underline">
            Create the first one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {communities.map((c) => (
            <li key={c.id}>
              <Link
                href={`/r/${c.name}`}
                className={`${navItem} rounded-lg border border-d-divider bg-d-secondary px-3 py-3 no-underline hover:no-underline hover:bg-[var(--background-modifier-hover)]`}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-d-secondary-alt text-sm font-bold text-d-header"
                  aria-hidden
                >
                  {c.name[0]?.toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-d-header">
                    r/{c.name}
                  </span>
                  <span className="block truncate text-sm text-d-muted">
                    {c.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
