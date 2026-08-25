import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { OptionalCurrentUser } from "../common/decorators/optional-current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../common/guards/optional-jwt-auth.guard";
import type { UserPublic } from "../common/types/user-public";
import { PostsService } from "../posts/posts.service";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityDto } from "./dto/create-community.dto";

@Controller("communities")
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  list() {
    return this.communitiesService.list();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: UserPublic,
    @Body() dto: CreateCommunityDto,
  ) {
    return this.communitiesService.create(user.id, dto);
  }

  @Get("joined")
  @UseGuards(JwtAuthGuard)
  listJoined(@CurrentUser() user: UserPublic) {
    return this.communitiesService.listJoined(user.id);
  }

  @Get(":name/posts")
  @UseGuards(OptionalJwtAuthGuard)
  getPosts(
    @Param("name") name: string,
    @OptionalCurrentUser() user?: UserPublic,
  ) {
    return this.postsService.listByCommunity(name, user?.id);
  }

  @Get(":name")
  @UseGuards(OptionalJwtAuthGuard)
  getByName(
    @Param("name") name: string,
    @OptionalCurrentUser() user?: UserPublic,
  ) {
    return this.communitiesService.getByName(name, user?.id);
  }

  @Post(":name/join")
  @UseGuards(JwtAuthGuard)
  join(@Param("name") name: string, @CurrentUser() user: UserPublic) {
    return this.communitiesService.join(user.id, name);
  }
}
