import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Resend } from "resend";
import * as bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import type { Response } from "express";
import { PrismaService } from "../common/prisma/prisma.service";
import { toUserPublic, UserPublic } from "../common/types/user-public";
import { LoginDto } from "./dto/login.dto";
import { MagicLinkDto } from "./dto/magic-link.dto";
import { RegisterDto } from "./dto/register.dto";
import { GoogleProfile } from "./types/google-profile";
import { JwtPayload } from "./types/jwt-payload";

export const ACCESS_TOKEN_COOKIE = "access_token";

@Injectable()
export class AuthService {
  private resend: Resend | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  getProviders(): { google: boolean; magicLink: boolean } {
    return {
      google: Boolean(
        this.configService.get("GOOGLE_CLIENT_ID") &&
          this.configService.get("GOOGLE_CLIENT_SECRET") &&
          this.configService.get("GOOGLE_CALLBACK_URL"),
      ),
      magicLink: Boolean(this.resend && this.configService.get("EMAIL_FROM")),
    };
  }

  async register(dto: RegisterDto): Promise<UserPublic> {
    const username = dto.username.toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username }],
      },
    });

    if (existing) {
      throw new ConflictException("Email or username already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });

    return toUserPublic(user);
  }

  async login(dto: LoginDto): Promise<UserPublic> {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email, username, or password");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email, username, or password");
    }

    return toUserPublic(user);
  }

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<UserPublic> {
    const email = profile.email.toLowerCase();

    const byGoogle = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });
    if (byGoogle) {
      return toUserPublic(byGoogle);
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      const linked = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: profile.googleId,
          displayName: byEmail.displayName ?? profile.displayName,
          avatarUrl: byEmail.avatarUrl ?? profile.avatarUrl,
        },
      });
      return toUserPublic(linked);
    }

    const username = await this.generateUsername(email);
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        googleId: profile.googleId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
    });
    return toUserPublic(user);
  }

  async sendMagicLink(dto: MagicLinkDto): Promise<{ success: true }> {
    if (!this.resend) {
      throw new BadRequestException("Magic link email is not configured");
    }

    const from = this.configService.get<string>("EMAIL_FROM");
    if (!from) {
      throw new BadRequestException("Magic link email is not configured");
    }

    const email = dto.email.toLowerCase();
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.magicLinkToken.create({
      data: { email, token, expiresAt },
    });

    const webUrl = this.configService.get<string>(
      "WEB_URL",
      "http://localhost:3000",
    );
    const verifyUrl = `${webUrl}/api/auth/magic-link/verify?token=${token}`;

    const { error } = await this.resend.emails.send({
      from,
      to: email,
      subject: "Your reddit-clone sign-in link",
      html: `
        <p>Click the link below to sign in. It expires in 15 minutes.</p>
        <p><a href="${verifyUrl}">Sign in to reddit-clone</a></p>
        <p>Or copy this URL: ${verifyUrl}</p>
      `,
    });

    if (error) {
      throw new InternalServerErrorException("Failed to send magic link email");
    }

    return { success: true };
  }

  async verifyMagicLink(token: string): Promise<UserPublic> {
    const record = await this.prisma.magicLinkToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Magic link is invalid or expired");
    }

    await this.prisma.magicLinkToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    const email = record.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return toUserPublic(existing);
    }

    const username = await this.generateUsername(email);
    const user = await this.prisma.user.create({
      data: { username, email },
    });
    return toUserPublic(user);
  }

  signToken(user: UserPublic): string {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN", "7d");
    return this.jwtService.sign(payload, {
      expiresIn: parseExpiresInSeconds(expiresIn),
    });
  }

  attachAuthCookie(res: Response, user: UserPublic): void {
    const token = this.signToken(user);
    res.cookie(ACCESS_TOKEN_COOKIE, token, this.getCookieOptions());
  }

  clearAuthCookie(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  getWebRedirectUrl(): string {
    return this.configService.get<string>("WEB_URL", "http://localhost:3000");
  }

  getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  } {
    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN", "7d");
    const maxAgeMs = parseExpiresInMs(expiresIn);

    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeMs,
    };
  }

  private async generateUsername(email: string): Promise<string> {
    const base = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 16);
    const prefix = base.length >= 3 ? base : `user_${base}`;

    for (let i = 0; i < 20; i++) {
      const suffix = i === 0 ? "" : `_${randomBytes(2).toString("hex")}`;
      const candidate = `${prefix}${suffix}`.slice(0, 20);
      const exists = await this.prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!exists) {
        return candidate;
      }
    }

    return `user_${randomBytes(4).toString("hex")}`;
  }
}

function parseExpiresInMs(expiresIn: string): number {
  return parseExpiresInSeconds(expiresIn) * 1000;
}

function parseExpiresInSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}
