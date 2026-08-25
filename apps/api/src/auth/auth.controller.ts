import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Response } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { UserPublic } from "../common/types/user-public";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { MagicLinkDto } from "./dto/magic-link.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("providers")
  providers() {
    return this.authService.getProviders();
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserPublic> {
    const user = await this.authService.register(dto);
    this.authService.attachAuthCookie(res, user);
    return user;
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserPublic> {
    const user = await this.authService.login(dto);
    this.authService.attachAuthCookie(res, user);
    return user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    this.authService.clearAuthCookie(res);
    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: UserPublic): UserPublic {
    return user;
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth(): void {
    // Passport redirects to Google.
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleCallback(
    @CurrentUser() user: UserPublic,
    @Res() res: Response,
  ): void {
    this.authService.attachAuthCookie(res, user);
    res.redirect(this.authService.getWebRedirectUrl());
  }

  @Post("magic-link")
  sendMagicLink(@Body() dto: MagicLinkDto) {
    return this.authService.sendMagicLink(dto);
  }

  @Get("magic-link/verify")
  async verifyMagicLink(
    @Query("token") token: string,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.authService.verifyMagicLink(token);
    this.authService.attachAuthCookie(res, user);
    res.redirect(this.authService.getWebRedirectUrl());
  }
}
