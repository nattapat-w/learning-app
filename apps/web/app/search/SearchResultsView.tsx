"use client";

import Link from "next/link";
import { useSearchQuery } from "../../lib/hooks/use-api-queries";
import type { SearchResults } from "../../lib/types";
import { contentCard, linkAccent, meta } from "../../lib/ui";

type SearchResultsViewProps = {
  query: string;
  initialResults: SearchResults | null;
};

export function SearchResultsView({
  query,
  initialResults,
}: SearchResultsViewProps) {
  const trimmed = query.trim();
  const { data: results, isFetching } = useSearchQuery(trimmed, initialResults ?? undefined);

  if (!trimmed) {
    return (
      <p className="text-sm text-d-muted">
        Enter a search term in the header to find communities, posts, and
        users.
      </p>
    );
  }

  if (!results) {
    return <p className="text-sm text-d-muted">Searching…</p>;
  }

  const empty =
    results.communities.length === 0 &&
    results.posts.length === 0 &&
    results.users.length === 0;

  return (
    <>
      {isFetching && (
        <p className="mb-4 text-xs text-d-muted">Updating results…</p>
      )}

      {empty && (
        <p className="text-sm text-d-muted">No results found.</p>
      )}

      {results.communities.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-d-muted">
            Communities
          </h2>
          <ul className="space-y-2">
            {results.communities.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/r/${c.name}`}
                  className={`${contentCard} block p-3 no-underline hover:no-underline hover:border-d-muted`}
                >
                  <p className="text-sm font-bold text-d-header">r/{c.name}</p>
                  <p className={meta}>{c.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.posts.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-d-muted">
            Posts
          </h2>
          <ul className="space-y-2">
            {results.posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/r/${p.community.name}/post/${p.id}`}
                  className={`${contentCard} block p-3 no-underline hover:no-underline hover:border-d-muted`}
                >
                  <p className="text-sm font-medium text-d-header">{p.title}</p>
                  <p className={meta}>
                    r/{p.community.name} · {p.score} points
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.users.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-d-muted">
            Users
          </h2>
          <ul className="space-y-2">
            {results.users.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/u/${u.username}`}
                  className={`${contentCard} block p-3 no-underline hover:no-underline hover:border-d-muted`}
                >
                  <p className="text-sm font-bold text-d-header">
                    {u.displayName ?? u.username}
                  </p>
                  <p className={linkAccent}>u/{u.username}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
