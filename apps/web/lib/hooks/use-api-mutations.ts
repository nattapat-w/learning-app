import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiClientError, apiClient, apiClientFormData } from "../api-client";
import { queryKeys } from "../query-keys";
import type { CommentPublic, CommunitySummary, UserPublic } from "../types";

export type AuthProviders = {
  google: boolean;
  line: boolean;
  magicLink: boolean;
  lineOAuthVersion?: number;
  googleMissing?: string[];
  lineMissing?: string[];
};

export function useAuthProviders(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.providers,
    queryFn: () => apiClient<AuthProviders>("/auth/providers"),
    enabled,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: { identifier: string; password: string }) =>
      apiClient<UserPublic>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.refresh();
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: { username: string; email: string; password: string }) =>
      apiClient<UserPublic>("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.refresh();
    },
  });
}

export function useMagicLinkMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient("/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      apiClient("/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.clear();
      router.refresh();
    },
  });
}

type VoteResult = { score: number; userVote: number | null };

export function useVoteMutation(
  targetType: "post" | "comment",
  targetId: string,
  onUnauthorized?: () => void,
) {
  const base =
    targetType === "post"
      ? `/posts/${encodeURIComponent(targetId)}/vote`
      : `/comments/${encodeURIComponent(targetId)}/vote`;

  return useMutation({
    mutationFn: (value: 1 | -1) =>
      apiClient<VoteResult>(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      }),
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 401) {
        onUnauthorized?.();
      }
    },
  });
}

export function useJoinCommunityMutation(communityName: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      apiClient(`/communities/${encodeURIComponent(communityName)}/join`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.joined });
      queryClient.invalidateQueries({
        queryKey: queryKeys.communities.detail(communityName),
      });
      router.refresh();
    },
  });
}

type CreatePostInput = {
  title: string;
  body?: string;
  imageFile?: File | null;
};

export function useCreatePostMutation(communityName: string) {
  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      let imageUrl: string | undefined;

      if (input.imageFile) {
        const formData = new FormData();
        formData.append("file", input.imageFile);
        const upload = await apiClientFormData<{ url: string }>(
          "/uploads/image",
          formData,
        );
        if (!upload.url?.startsWith("/uploads/")) {
          throw new Error("Invalid upload response from server");
        }
        imageUrl = upload.url;
      }

      return apiClient<{ id: string }>("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityName,
          title: input.title,
          body: input.body ?? "",
          imageUrl,
        }),
      });
    },
  });
}

type CreateCommentInput = {
  body: string;
  parentId?: string;
};

export function useCreateCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      apiClient<CommentPublic>(
        `/posts/${encodeURIComponent(postId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.comments(postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      router.refresh();
    },
  });
}

type UpdateProfileInput = {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
};

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiClient<UserPublic>("/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      router.refresh();
    },
  });
}

type CreateCommunityInput = {
  name: string;
  title: string;
  description?: string;
};

export function useCreateCommunityMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateCommunityInput) =>
      apiClient<CommunitySummary>("/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.joined });
      router.push(`/r/${community.name}`);
      router.refresh();
    },
  });
}
