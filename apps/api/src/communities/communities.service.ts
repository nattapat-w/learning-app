import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import {
  findCommunityByName,
  normalizeCommunityName,
} from "../common/utils/community-name";
import {
  toCommunityPublic,
  toCommunitySummary,
  withViewerMembership,
} from "../common/mappers/content.mappers";
import {
  CommunityPublic,
  CommunitySummary,
} from "../common/types/post-public";
import { CreateCommunityDto } from "./dto/create-community.dto";

const DEFAULT_COMMUNITY_RULES = [
  {
    position: 1,
    title: "Remember the human",
    description:
      "Treat others with respect. Healthy communities allow for disagreement.",
  },
  {
    position: 2,
    title: "Abide by community rules",
    description: "Posts should fit the topic and spirit of the community.",
  },
  {
    position: 3,
    title: "Respect privacy",
    description: "Do not share personal information without consent.",
  },
  {
    position: 4,
    title: "No spam or self-promotion",
    description: "Keep posts authentic and relevant to the discussion.",
  },
  {
    position: 5,
    title: "Search before you post",
    description: "Check if your question has already been answered.",
  },
];

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CommunitySummary[]> {
    const communities = await this.prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, title: true },
    });
    return communities.map(toCommunitySummary);
  }

  async listJoined(userId: string): Promise<CommunitySummary[]> {
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
      include: {
        community: { select: { id: true, name: true, title: true } },
      },
    });
    return memberships.map((m) => toCommunitySummary(m.community));
  }

  private async getViewerMembership(
    communityId: string,
    creatorId: string,
    userId?: string,
  ): Promise<CommunityPublic["viewerMembership"]> {
    if (!userId) {
      return null;
    }

    const isCreator = creatorId === userId;
    const membership = await this.prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
      select: { role: true },
    });

    if (!membership) {
      return { isMember: false, role: null, isCreator };
    }

    return {
      isMember: true,
      role: membership.role,
      isCreator,
    };
  }

  async getByName(name: string, userId?: string): Promise<CommunityPublic> {
    const community = await this.prisma.community.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
      },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        rules: { orderBy: { position: "asc" } },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!community) {
      throw new NotFoundException("Community not found");
    }

    const publicCommunity = toCommunityPublic(community);
    const viewerMembership = await this.getViewerMembership(
      community.id,
      community.creatorId,
      userId,
    );
    return withViewerMembership(publicCommunity, viewerMembership);
  }

  async create(
    creatorId: string,
    dto: CreateCommunityDto,
  ): Promise<CommunityPublic> {
    const name = normalizeCommunityName(dto.name);

    const existing = await this.prisma.community.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException("Community name already taken");
    }

    const community = await this.prisma.community.create({
      data: {
        name,
        title: dto.title,
        description: dto.description,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            role: "MODERATOR",
          },
        },
        rules: {
          create: DEFAULT_COMMUNITY_RULES,
        },
      },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        rules: { orderBy: { position: "asc" } },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const publicCommunity = toCommunityPublic(community);
    const viewerMembership = await this.getViewerMembership(
      community.id,
      creatorId,
      creatorId,
    );
    return withViewerMembership(publicCommunity, viewerMembership);
  }

  async join(userId: string, name: string): Promise<{ success: true }> {
    const community = await findCommunityByName(this.prisma, name);
    if (!community) {
      throw new NotFoundException("Community not found");
    }

    const existing = await this.prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId: community.id },
      },
    });
    if (existing) {
      return { success: true };
    }

    await this.prisma.communityMember.create({
      data: {
        userId,
        communityId: community.id,
        role: "MEMBER",
      },
    });

    return { success: true };
  }
}
