export const queryKeys = {
  auth: {
    providers: ["auth", "providers"] as const,
    me: ["auth", "me"] as const,
  },
  communities: {
    all: ["communities"] as const,
    joined: ["communities", "joined"] as const,
    detail: (name: string) => ["communities", name] as const,
  },
  posts: {
    detail: (id: string) => ["posts", id] as const,
    comments: (postId: string) => ["posts", postId, "comments"] as const,
    feed: (feed: string, sort?: string) => ["posts", "feed", feed, sort] as const,
  },
  search: {
    results: (q: string) => ["search", q] as const,
  },
  users: {
    me: ["users", "me"] as const,
  },
};
