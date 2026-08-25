import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { UserPublic } from "../common/types/user-public";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":username/posts")
  listPosts(@Param("username") username: string) {
    return this.usersService.listPostsByUsername(username.toLowerCase());
  }

  @Get(":username/comments")
  listComments(@Param("username") username: string) {
    return this.usersService.listCommentsByUsername(username.toLowerCase());
  }

  @Get(":username/communities")
  listCommunities(@Param("username") username: string) {
    return this.usersService.listCommunitiesByUsername(username.toLowerCase());
  }

  @Get(":username")
  getPublicProfile(@Param("username") username: string): Promise<UserPublic> {
    return this.usersService.getPublicProfile(username.toLowerCase());
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: UserPublic,
    @Body() dto: UpdateUserDto,
  ): Promise<UserPublic> {
    return this.usersService.updateMe(user.id, dto);
  }
}
