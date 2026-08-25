/** Resolve API-hosted asset paths (e.g. /uploads/…) through the Next.js proxy. */
export function apiAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/api${path.startsWith("/") ? path : `/${path}`}`;
}
