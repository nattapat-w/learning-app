function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return process.env.API_URL ?? "http://localhost:3001";
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    if (cookieHeader) {
      headers.set("Cookie", cookieHeader);
    }
  }

  try {
    return await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers,
      credentials: typeof window !== "undefined" ? "include" : init?.credentials,
    });
  } catch {
    // API unreachable (down, wrong port, DB crash) — degrade instead of 500
    return new Response(null, { status: 503, statusText: "API unavailable" });
  }
}

export async function getMe(): Promise<import("./types").UserPublic | null> {
  const res = await apiFetch("/auth/me");
  if (res.status === 401 || !res.ok) {
    return null;
  }
  return res.json();
}

export async function getUser(
  username: string,
): Promise<import("./types").UserPublic | null> {
  const res = await apiFetch(`/users/${encodeURIComponent(username)}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function getPosts(
  limit = 25,
  feed: "home" | "popular" = "home",
  sort?: string,
): Promise<import("./types").PostPublic[]> {
  const params = new URLSearchParams({ limit: String(limit), feed });
  if (sort) params.set("sort", sort);
  const res = await apiFetch(`/posts?${params}`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function search(
  q: string,
  limit = 10,
): Promise<import("./types").SearchResults> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await apiFetch(`/search?${params}`);
  if (!res.ok) {
    return { communities: [], posts: [], users: [] };
  }
  return res.json();
}

export async function getUserPosts(
  username: string,
): Promise<import("./types").UserPostSummary[]> {
  const res = await apiFetch(
    `/users/${encodeURIComponent(username)}/posts`,
  );
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getUserComments(
  username: string,
): Promise<import("./types").CommentWithPostPublic[]> {
  const res = await apiFetch(
    `/users/${encodeURIComponent(username)}/comments`,
  );
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getUserCommunities(
  username: string,
): Promise<import("./types").UserCommunityPublic[]> {
  const res = await apiFetch(
    `/users/${encodeURIComponent(username)}/communities`,
  );
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getJoinedCommunities(): Promise<
  import("./types").CommunitySummary[]
> {
  const res = await apiFetch("/communities/joined");
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getCommunityPosts(
  name: string,
): Promise<import("./types").PostPublic[]> {
  const res = await apiFetch(
    `/communities/${encodeURIComponent(name)}/posts`,
  );
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getCommunity(
  name: string,
): Promise<import("./types").CommunityPublic | null> {
  const res = await apiFetch(`/communities/${encodeURIComponent(name)}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function getCommunities(): Promise<
  import("./types").CommunitySummary[]
> {
  const res = await apiFetch("/communities");
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getPost(
  id: string,
): Promise<import("./types").PostPublic | null> {
  const res = await apiFetch(`/posts/${encodeURIComponent(id)}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function getPostComments(
  postId: string,
): Promise<import("./types").CommentPublic[]> {
  const res = await apiFetch(`/posts/${encodeURIComponent(postId)}/comments`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
