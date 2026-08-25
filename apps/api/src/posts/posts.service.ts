import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { toPostPublic } from "../common/mappers/content.mappers";
import { findCommunityByName, normalizeCommunityName } from "../common/utils/community-name";
import { PostPublic } from "../common/types/post-public";
import { VotesService } from "../votes/votes.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { isPostSort, sortPosts, type PostSort } from "./post-sort";

const postInclude = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  community: {
    select: {
      id: true,
      name: true,
      title: true,
    },
  },
  _count: {
    select: { comments: true },
  },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly votesService: VotesService,
  ) {}

  private async mapPosts(
    posts: Array<{
      id: string;
      title: string;
      body: string | null;
      score: number;
      createdAt: Date;
      updatedAt: Date;
      author: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
      community: { id: string; name: string; title: string };
      _count: { comments: number };
    }>,
    userId?: string,
  ): Promise<PostPublic[]> {
    const voteMap = userId
      ? await this.votesService.getUserVotesForPosts(userId, posts.map((p) => p.id))
      : new Map<string, number>();

    return posts.map((post) =>
      toPostPublic({
        ...post,
        userVote: voteMap.get(post.id) ?? null,
      }),
    );
  }

  async listRecent(limit = 25, userId?: string): Promise<PostPublic[]> {
    const posts = await this.prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });
    return this.mapPosts(posts, userId);
  }

  async listPopular(
    limit = 25,
    sort: PostSort = "hot",
    userId?: string,
  ): Promise<PostPublic[]> {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          { score: { gte: 1 } },
          { comments: { some: {} } },
          { createdAt: { gte: since } },
        ],
      },
      take: Math.min(limit * 3, 100),
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });
    const mapped = await this.mapPosts(posts, userId);
    return sortPosts(mapped, sort).slice(0, limit);
  }

  async listFeed(
    feed: "home" | "popular",
    limit = 25,
    sort: PostSort = "best",
    userId?: string,
  ): Promise<PostPublic[]> {
    const safeSort = isPostSort(sort) ? sort : "best";
    if (feed === "popular") {
      return this.listPopular(limit, safeSort === "best" ? "hot" : safeSort, userId);
    }

    const fetchLimit = safeSort === "new" ? limit : Math.min(limit * 3, 100);
    const orderBy =
      safeSort === "top"
        ? { score: "desc" as const }
        : { createdAt: "desc" as const };

    const posts = await this.prisma.post.findMany({
      take: fetchLimit,
      orderBy,
      include: postInclude,
    });
    const mapped = await this.mapPosts(posts, userId);
    if (safeSort === "new" || safeSort === "top") {
      return mapped.slice(0, limit);
    }
    return sortPosts(mapped, safeSort).slice(0, limit);
  }

  async listByCommunity(
    communityName: string,
    userId?: string,
  ): Promise<PostPublic[]> {
    const community = await findCommunityByName(this.prisma, communityName);
    if (!community) {
      throw new NotFoundException("Community not found");
    }

    const posts = await this.prisma.post.findMany({
      where: { communityId: community.id },
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });
    return this.mapPosts(posts, userId);
  }

  async getById(id: string, userId?: string): Promise<PostPublic> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const voteMap = userId
      ? await this.votesService.getUserVotesForPosts(userId, [id])
      : new Map<string, number>();

    return toPostPublic({
      ...post,
      userVote: voteMap.get(id) ?? null,
    });
  }

  async create(authorId: string, dto: CreatePostDto): Promise<PostPublic> {
    const communityName = normalizeCommunityName(dto.communityName);
    const community = await findCommunityByName(this.prisma, communityName);
    if (!community) {
      throw new NotFoundException("Community not found");
    }

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        authorId,
        communityId: community.id,
      },
      include: postInclude,
    });

    return toPostPublic({ ...post, userVote: null });
  }

  async delete(postId: string, userId: string): Promise<{ success: true }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException("You can only delete your own posts");
    }

    await this.prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }
}
