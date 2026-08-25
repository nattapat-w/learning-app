import {
  AuthorSummary,
  CommentPublic,
  CommunityPublic,
  CommunityRulePublic,
  CommunitySummary,
  PostPublic,
} from "../types/post-public";

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
};

export function toAuthorSummary(user: {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}): AuthorSummary {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

export function toCommunitySummary(community: {
  id: string;
  name: string;
  title: string;
}): CommunitySummary {
  return {
    id: community.id,
    name: community.name,
    title: community.title,
  };
}

export function toCommunityRulePublic(rule: {
  id: string;
  position: number;
  title: string;
  description: string | null;
}): CommunityRulePublic {
  return {
    id: rule.id,
    position: rule.position,
    title: rule.title,
    description: rule.description,
  };
}

export function toPostPublic(post: {
  id: string;
  title: string;
  body: string | null;
  imageUrl?: string | null;
  score: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  community: {
    id: string;
    name: string;
    title: string;
  };
  _count?: { comments: number };
  userVote?: number | null;
}): PostPublic {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl ?? null,
    score: post.score,
    commentCount: post._count?.comments ?? 0,
    userVote: post.userVote ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: toAuthorSummary(post.author),
    community: toCommunitySummary(post.community),
  };
}

export function toCommentPublic(comment: {
  id: string;
  body: string;
  score: number;
  createdAt: Date;
  parentId: string | null;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  userVote?: number | null;
}): CommentPublic {
  return {
    id: comment.id,
    body: comment.body,
    score: comment.score,
    userVote: comment.userVote ?? null,
    createdAt: comment.createdAt,
    parentId: comment.parentId,
    author: toAuthorSummary(comment.author),
  };
}

export function toCommunityPublic(community: {
  id: string;
  name: string;
  title: string;
  description: string | null;
  createdAt: Date;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  rules: Array<{
    id: string;
    position: number;
    title: string;
    description: string | null;
  }>;
  members: Array<{
    role: string;
    user: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }>;
}): CommunityPublic {
  const moderators = community.members
    .filter((m) => m.role === "MODERATOR")
    .map((m) => toAuthorSummary(m.user));

  return {
    id: community.id,
    name: community.name,
    title: community.title,
    description: community.description,
    createdAt: community.createdAt,
    creator: toAuthorSummary(community.creator),
    memberCount: community.members.length,
    moderatorCount: moderators.length,
    moderators,
    rules: community.rules
      .sort((a, b) => a.position - b.position)
      .map(toCommunityRulePublic),
    viewerMembership: null,
  };
}

export function withViewerMembership(
  community: CommunityPublic,
  membership: CommunityPublic["viewerMembership"],
): CommunityPublic {
  return { ...community, viewerMembership: membership };
}
