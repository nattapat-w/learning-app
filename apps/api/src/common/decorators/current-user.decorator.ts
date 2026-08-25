import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPublic } from "../types/user-public";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPublic => {
    const request = ctx.switchToHttp().getRequest<{ user: UserPublic }>();
    return request.user;
  },
);
