import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { UserPublic } from "../common/types/user-public";
import { VoteDto } from "./dto/vote.dto";
import { VotesService } from "./votes.service";

@Controller()
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post("posts/:id/vote")
  @UseGuards(JwtAuthGuard)
  votePost(
    @Param("id") id: string,
    @CurrentUser() user: UserPublic,
    @Body() dto: VoteDto,
  ) {
    return this.votesService.votePost(user.id, id, dto.value);
  }

  @Post("comments/:id/vote")
  @UseGuards(JwtAuthGuard)
  voteComment(
    @Param("id") id: string,
    @CurrentUser() user: UserPublic,
    @Body() dto: VoteDto,
  ) {
    return this.votesService.voteComment(user.id, id, dto.value);
  }
}
