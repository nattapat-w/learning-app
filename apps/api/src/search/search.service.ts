import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { toCommunitySummary } from "../common/mappers/content.mappers";
import type { CommunitySummary } from "../common/types/post-public";

type SearchUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type SearchPost = {
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

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string, limit = 10): Promise<SearchResults> {
    const term = q.trim();
    if (!term) {
      return { communities: [], posts: [], users: [] };
    }

    const safeLimit = Math.min(Math.max(limit, 1), 25);

    const [communities, posts, users] = await Promise.all([
      this.prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { title: { contains: term, mode: "insensitive" } },
          ],
        },
        take: safeLimit,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, title: true },
      }),
      this.prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { body: { contains: term, mode: "insensitive" } },
          ],
        },
        take: safeLimit,
        orderBy: { score: "desc" },
        select: {
          id: true,
          title: true,
          score: true,
          community: { select: { id: true, name: true, title: true } },
        },
      }),
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: term, mode: "insensitive" } },
            { displayName: { contains: term, mode: "insensitive" } },
          ],
        },
        take: safeLimit,
        orderBy: { username: "asc" },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      }),
    ]);

    return {
      communities: communities.map(toCommunitySummary),
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        score: p.score,
        community: toCommunitySummary(p.community),
      })),
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
      })),
    };
  }
}
