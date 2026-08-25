const STORAGE_KEY = "reddit-clone-recent-visits";
const MAX_ITEMS = 8;

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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordCommunityVisit(name: string, title: string): void {
  if (typeof window === "undefined") return;
  const existing = getRecentVisits().filter((v) => v.name !== name);
  const next: RecentVisit[] = [
    { name, title, visitedAt: Date.now() },
    ...existing,
  ].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
