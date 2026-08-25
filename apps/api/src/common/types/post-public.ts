export type AuthorSummary = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type CommunitySummary = {
  id: string;
  name: string;
  title: string;
};

export type CommunityRulePublic = {
  id: string;
  position: number;
  title: string;
  description: string | null;
};

export type CommunityPublic = CommunitySummary & {
  description: string | null;
  createdAt: Date;
  creator: AuthorSummary;
  memberCount: number;
  moderatorCount: number;
  moderators: AuthorSummary[];
  rules: CommunityRulePublic[];
  viewerMembership: CommunityViewerMembership | null;
};

export type CommunityViewerMembership = {
  isMember: boolean;
  role: string | null;
  isCreator: boolean;
};

export type PostPublic = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  score: number;
  commentCount: number;
  userVote: number | null;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorSummary;
  community: CommunitySummary;
};

export type CommentPublic = {
  id: string;
  body: string;
  score: number;
  userVote: number | null;
  createdAt: Date;
  parentId: string | null;
  author: AuthorSummary;
};

export type CommentWithPostPublic = CommentPublic & {
  post: {
    id: string;
    title: string;
    community: CommunitySummary;
  };
};

export type UserCommunityPublic = CommunitySummary & {
  joinedAt: Date;
  role: string;
  isCreator: boolean;
};
