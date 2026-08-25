import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { VoteTarget } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";

export type VoteResult = {
  score: number;
  userVote: number | null;
};

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserVotesForPosts(
    userId: string,
    postIds: string[],
  ): Promise<Map<string, number>> {
    if (postIds.length === 0) {
      return new Map();
    }
    const votes = await this.prisma.vote.findMany({
      where: {
        userId,
        targetType: VoteTarget.POST,
        targetId: { in: postIds },
      },
      select: { targetId: true, value: true },
    });
    return new Map(votes.map((v) => [v.targetId, v.value]));
  }

  async getUserVotesForComments(
    userId: string,
    commentIds: string[],
  ): Promise<Map<string, number>> {
    if (commentIds.length === 0) {
      return new Map();
    }
    const votes = await this.prisma.vote.findMany({
      where: {
        userId,
        targetType: VoteTarget.COMMENT,
        targetId: { in: commentIds },
      },
      select: { targetId: true, value: true },
    });
    return new Map(votes.map((v) => [v.targetId, v.value]));
  }

  async votePost(userId: string, postId: string, value: 1 | -1): Promise<VoteResult> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return this.applyVote(userId, VoteTarget.POST, postId, value, async (delta) => {
      const updated = await this.prisma.post.update({
        where: { id: postId },
        data: { score: { increment: delta } },
        select: { score: true },
      });
      return updated.score;
    });
  }

  async voteComment(
    userId: string,
    commentId: string,
    value: 1 | -1,
  ): Promise<VoteResult> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    return this.applyVote(userId, VoteTarget.COMMENT, commentId, value, async (delta) => {
      const updated = await this.prisma.comment.update({
        where: { id: commentId },
        data: { score: { increment: delta } },
        select: { score: true },
      });
      return updated.score;
    });
  }

  private async applyVote(
    userId: string,
    targetType: VoteTarget,
    targetId: string,
    value: 1 | -1,
    updateScore: (delta: number) => Promise<number>,
  ): Promise<VoteResult> {
    const existing = await this.prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
    });

    let scoreDelta = 0;
    let userVote: number | null = null;

    if (!existing) {
      scoreDelta = value;
      userVote = value;
      await this.prisma.vote.create({
        data: { userId, targetType, targetId, value },
      });
    } else if (existing.value === value) {
      scoreDelta = -value;
      userVote = null;
      await this.prisma.vote.delete({ where: { id: existing.id } });
    } else {
      scoreDelta = value - existing.value;
      userVote = value;
      await this.prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
    }

    const score = await updateScore(scoreDelta);
    return { score, userVote };
  }
}
