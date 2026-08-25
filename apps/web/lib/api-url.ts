/** Base URL for the Nest API (no trailing slash). */
export function getApiUrl(): string | null {
  const fromEnv = process.env.API_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  // Never proxy to localhost from Vercel — causes DNS_HOSTNAME_RESOLVED_PRIVATE / 404
  if (process.env.VERCEL) {
    return null;
  }

  return "http://localhost:3001";
}
