import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UserPublic } from "../types/user-public";

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPublic | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserPublic }>();
    return request.user;
  },
);
