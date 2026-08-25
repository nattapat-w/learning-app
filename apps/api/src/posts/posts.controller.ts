import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommentsService } from "../comments/comments.service";
import { CreateCommentDto } from "../comments/dto/create-comment.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { OptionalCurrentUser } from "../common/decorators/optional-current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../common/guards/optional-jwt-auth.guard";
import type { UserPublic } from "../common/types/user-public";
import { CreatePostDto } from "./dto/create-post.dto";
import { isPostSort } from "./post-sort";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(
    @Query("limit") limit?: string,
    @Query("feed") feed?: string,
    @Query("sort") sort?: string,
    @OptionalCurrentUser() user?: UserPublic,
  ) {
    const parsed = limit ? Number(limit) : 25;
    const safeLimit =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 100) : 25;
    const safeFeed = feed === "popular" ? "popular" : "home";
    const safeSort = sort && isPostSort(sort) ? sort : "best";
    return this.postsService.listFeed(
      safeFeed,
      safeLimit,
      safeSort,
      user?.id,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: UserPublic, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  getById(@Param("id") id: string, @OptionalCurrentUser() user?: UserPublic) {
    return this.postsService.getById(id, user?.id);
  }

  @Get(":id/comments")
  @UseGuards(OptionalJwtAuthGuard)
  listComments(
    @Param("id") id: string,
    @OptionalCurrentUser() user?: UserPublic,
  ) {
    return this.commentsService.listByPost(id, user?.id);
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param("id") id: string,
    @CurrentUser() user: UserPublic,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(id, user.id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUser() user: UserPublic, @Param("id") id: string) {
    return this.postsService.delete(id, user.id);
  }
}
