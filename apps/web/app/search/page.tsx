import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { search } from "../../lib/api";
import { contentCard, heading, linkAccent, meta } from "../../lib/ui";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await search(query, 15) : null;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className={heading}>Search</h1>
        {query && (
          <p className="mt-1 text-sm text-d-muted">
            Results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {!query && (
        <p className="text-sm text-d-muted">
          Enter a search term in the header to find communities, posts, and
          users.
        </p>
      )}

      {results && results.communities.length === 0 && results.posts.length === 0 && results.users.length === 0 && (
        <p className="text-sm text-d-muted">No results found.</p>
      )}

      {results && results.communities.length > 0 && (
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

      {results && results.posts.length > 0 && (
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

      {results && results.users.length > 0 && (
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
    </AppShell>
  );
}
