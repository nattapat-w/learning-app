import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import {
  toCommentPublic,
  toCommunitySummary,
} from "../common/mappers/content.mappers";
import {
  CommentWithPostPublic,
  UserCommunityPublic,
} from "../common/types/post-public";
import { toUserPublic, UserPublic } from "../common/types/user-public";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserPublic | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toUserPublic(user) : null;
  }

  async findByUsername(username: string): Promise<UserPublic | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return user ? toUserPublic(user) : null;
  }

  async getPublicProfile(username: string): Promise<UserPublic> {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserPublic> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      },
    });
    return toUserPublic(user);
  }

  async listPostsByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        score: true,
        createdAt: true,
        community: { select: { id: true, name: true, title: true } },
      },
    });
  }

  async listCommentsByUsername(username: string): Promise<CommentWithPostPublic[]> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const comments = await this.prisma.comment.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            community: { select: { id: true, name: true, title: true } },
          },
        },
      },
    });

    return comments.map((comment) => ({
      ...toCommentPublic({ ...comment, userVote: null }),
      post: {
        id: comment.post.id,
        title: comment.post.title,
        community: toCommunitySummary(comment.post.community),
      },
    }));
  }

  async listCommunitiesByUsername(username: string): Promise<UserCommunityPublic[]> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const memberships = await this.prisma.communityMember.findMany({
      where: { userId: user.id },
      orderBy: { joinedAt: "desc" },
      include: {
        community: {
          select: { id: true, name: true, title: true, creatorId: true },
        },
      },
    });

    return memberships.map((m) => ({
      ...toCommunitySummary(m.community),
      joinedAt: m.joinedAt,
      role: m.role,
      isCreator: m.community.creatorId === user.id,
    }));
  }
}
