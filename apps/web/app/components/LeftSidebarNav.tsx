"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CommunitySummary } from "../../lib/types";
import { getRecentVisits, type RecentVisit } from "../../lib/recent-visits";
import {
  leftRail,
  navItem,
  navItemActive,
  sidebarSection,
  stickyBelowHeader,
} from "../../lib/ui";

type LeftSidebarNavProps = {
  communities: CommunitySummary[];
  communitiesLabel?: string;
};

export function LeftSidebarNav({
  communities,
  communitiesLabel = "Communities",
}: LeftSidebarNavProps) {
  const pathname = usePathname();
  const [recent, setRecent] = useState<RecentVisit[]>([]);

  useEffect(() => {
    setRecent(getRecentVisits());
  }, [pathname]);

  const isHome = pathname === "/";
  const isPopular = pathname === "/popular";
  const isCreateCommunity = pathname === "/communities/new";

  return (
    <aside className={`${leftRail} ${stickyBelowHeader}`}>
      <nav className="space-y-0.5 pr-1">
        <Link
          href="/"
          className={`${isHome ? navItemActive : navItem} no-underline hover:no-underline`}
        >
          <span className="flex h-6 w-6 items-center justify-center text-base" aria-hidden>
            ⌂
          </span>
          Home
        </Link>
        <Link
          href="/popular"
          className={`${isPopular ? navItemActive : navItem} no-underline hover:no-underline ${isPopular ? "" : "text-d-muted"}`}
        >
          <span className="flex h-6 w-6 items-center justify-center text-base" aria-hidden>
            ★
          </span>
          Popular
        </Link>
        <Link
          href="/communities/new"
          className={`${isCreateCommunity ? navItemActive : navItem} no-underline hover:no-underline ${isCreateCommunity ? "" : "text-d-muted"}`}
        >
          <span className="flex h-6 w-6 items-center justify-center text-base" aria-hidden>
            +
          </span>
          Create Community
        </Link>
      </nav>

      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className={sidebarSection}>Recent</h2>
          <ul className="space-y-0.5 pr-1">
            {recent.map((v) => (
              <li key={v.name}>
                <Link
                  href={`/r/${v.name}`}
                  className={`${navItem} no-underline hover:no-underline`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-d-secondary-alt text-xs font-bold text-d-header"
                    aria-hidden
                  >
                    {v.name[0]?.toUpperCase()}
                  </span>
                  <span className="truncate">r/{v.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {communities.length > 0 && (
        <div className="mt-8">
          <h2 className={sidebarSection}>{communitiesLabel}</h2>
          <ul className="space-y-0.5 pr-1">
            {communities.slice(0, 10).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/r/${c.name}`}
                  className={`${navItem} no-underline hover:no-underline`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-d-secondary-alt text-xs font-bold text-d-header"
                    aria-hidden
                  >
                    {c.name[0]?.toUpperCase()}
                  </span>
                  <span className="truncate">r/{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
