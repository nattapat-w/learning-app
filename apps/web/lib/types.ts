export type UserPublic = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

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
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
  author: AuthorSummary;
  community: CommunitySummary;
};

export type CommentPublic = {
  id: string;
  body: string;
  score: number;
  userVote: number | null;
  createdAt: string;
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

export type UserPostSummary = {
  id: string;
  title: string;
  imageUrl: string | null;
  score: number;
  createdAt: string;
  community: CommunitySummary;
};

export type UserCommunityPublic = CommunitySummary & {
  joinedAt: string;
  role: string;
  isCreator: boolean;
};

export type SearchUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type SearchPost = {
  id: string;
  title: string;
  score: number;
  community: CommunitySummary;
};

export type SearchResults = {
  communities: CommunitySummary[];
  posts: SearchPost[];
  users: SearchUser[];
};

export type VoteResult = {
  score: number;
  userVote: number | null;
};
