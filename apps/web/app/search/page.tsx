import { AppShell } from "../components/AppShell";
import { search } from "../../lib/api";
import { heading } from "../../lib/ui";
import { SearchResultsView } from "./SearchResultsView";

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

      <SearchResultsView query={query} initialResults={results} />
    </AppShell>
  );
}
