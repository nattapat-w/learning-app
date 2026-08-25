import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { toCommentPublic } from "../common/mappers/content.mappers";
import { CommentPublic } from "../common/types/post-public";
import { VotesService } from "../votes/votes.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

const commentInclude = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
};

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly votesService: VotesService,
  ) {}

  async listByPost(postId: string, userId?: string): Promise<CommentPublic[]> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: commentInclude,
    });

    const voteMap = userId
      ? await this.votesService.getUserVotesForComments(
          userId,
          comments.map((c) => c.id),
        )
      : new Map<string, number>();

    return comments.map((comment) =>
      toCommentPublic({
        ...comment,
        userVote: voteMap.get(comment.id) ?? null,
      }),
    );
  }

  async create(
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ): Promise<CommentPublic> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, postId },
      });
      if (!parent) {
        throw new NotFoundException("Parent comment not found");
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body.trim(),
        postId,
        authorId,
        parentId: dto.parentId,
      },
      include: commentInclude,
    });

    return toCommentPublic({ ...comment, userVote: null });
  }
}
