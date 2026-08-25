import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { UserPublic } from "../types/user-public";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // No or invalid JWT — public read still allowed
    }
    return true;
  }

  handleRequest<TUser = UserPublic>(
    _err: unknown,
    user: TUser,
  ): TUser | undefined {
    return user ?? undefined;
  }
}
