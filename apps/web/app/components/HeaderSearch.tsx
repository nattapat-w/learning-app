"use client";

import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { startNavigationProgress } from "../../lib/navigation-progress";

export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const communityScope = useMemo(() => {
    const match = pathname.match(/^\/r\/([^/]+)(?:\/|$)/);
    if (!match) return null;
    const segment = match[1];
    if (segment === "popular") return null;
    return segment;
  }, [pathname]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    startNavigationProgress();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function clearScope() {
    if (communityScope) {
      startNavigationProgress();
      router.push("/");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="hidden min-w-0 flex-1 sm:flex sm:items-center lg:max-w-[640px]"
    >
      <div className="flex h-9 w-full items-center gap-2 rounded-full border border-d-divider bg-d-inset px-3 focus-within:border-d-link focus-within:bg-d-secondary">
        {communityScope && (
          <button
            type="button"
            onClick={clearScope}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-d-secondary-alt px-2 py-0.5 text-xs font-bold text-d-header transition-colors hover:bg-[var(--background-modifier-hover)]"
          >
            r/{communityScope}
            <span className="text-d-muted" aria-hidden>×</span>
          </button>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={communityScope ? `Search in r/${communityScope}` : "Search Reddit"}
          className="min-w-0 flex-1 bg-transparent text-sm text-d-normal placeholder:text-d-muted focus:outline-none"
          aria-label="Search"
        />
      </div>
    </form>
  );
}
