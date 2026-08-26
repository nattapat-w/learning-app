import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { queryKeys } from "../query-keys";
import type {
  CommentPublic,
  SearchResults,
  UserPublic,
} from "../types";

export function useMeQuery(initialData?: UserPublic | null) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        return await apiClient<UserPublic>("/auth/me");
      } catch {
        return null;
      }
    },
    initialData,
    staleTime: 30 * 1000,
  });
}

export function usePostCommentsQuery(
  postId: string,
  initialData?: CommentPublic[],
) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () =>
      apiClient<CommentPublic[]>(
        `/posts/${encodeURIComponent(postId)}/comments`,
      ),
    initialData,
  });
}

export function useSearchQuery(query: string, initialData?: SearchResults) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.search.results(trimmed),
    queryFn: async () => {
      const params = new URLSearchParams({ q: trimmed, limit: "15" });
      return apiClient<SearchResults>(`/search?${params}`);
    },
    enabled: trimmed.length > 0,
    initialData: trimmed.length > 0 ? initialData : undefined,
  });
}
