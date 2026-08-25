const STORAGE_KEY = "reddit-clone-recent-visits";
const MAX_ITEMS = 8;

export const RECENT_VISITS_UPDATED_EVENT = "recent-visits-updated";

export type RecentVisit = {
  name: string;
  title: string;
  visitedAt: number;
};

export function getRecentVisits(): RecentVisit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentVisit[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (v) =>
          v &&
          typeof v.name === "string" &&
          v.name.length > 0 &&
          typeof v.title === "string",
      )
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function recordCommunityVisit(name: string, title: string): void {
  if (typeof window === "undefined") return;
  const normalizedName = name.trim().toLowerCase();
  const normalizedTitle = title.trim() || name;
  if (!normalizedName) return;

  const existing = getRecentVisits().filter(
    (v) => v.name.toLowerCase() !== normalizedName,
  );
  const next: RecentVisit[] = [
    { name: normalizedName, title: normalizedTitle, visitedAt: Date.now() },
    ...existing,
  ].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(RECENT_VISITS_UPDATED_EVENT));
}
