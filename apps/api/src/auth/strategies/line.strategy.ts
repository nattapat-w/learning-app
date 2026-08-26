import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { UserPublic } from "../../common/types/user-public";
import { AuthService } from "../auth.service";

type LineUserProfile = {
  userId: string;
  displayName?: string;
  pictureUrl?: string;
};

@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, "line") {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      authorizationURL: "https://access.line.me/oauth2/v2.1/authorize",
      tokenURL: "https://api.line.me/oauth2/v2.1/token",
      clientID: configService.getOrThrow<string>("LINE_CHANNEL_ID"),
      clientSecret: configService.getOrThrow<string>("LINE_CHANNEL_SECRET"),
      callbackURL: configService.getOrThrow<string>("LINE_CALLBACK_URL"),
      scope: ["profile", "openid"],
      state: true,
    });
  }

  async validate(accessToken: string): Promise<UserPublic> {
    const profile = await this.fetchLineProfile(accessToken);
    return this.authService.findOrCreateLineUser({
      lineId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.pictureUrl,
    });
  }

  private async fetchLineProfile(accessToken: string): Promise<LineUserProfile> {
    const res = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new UnauthorizedException("Failed to fetch LINE profile");
    }

    return res.json() as Promise<LineUserProfile>;
  }
}
