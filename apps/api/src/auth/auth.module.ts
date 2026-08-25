import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

function isGoogleOAuthEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_CALLBACK_URL?.trim(),
  );
}

@Module({})
export class AuthModule {
  static register(): DynamicModule {
    const googleOAuthEnabled = isGoogleOAuthEnabled();

    return {
      module: AuthModule,
      imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService): JwtModuleOptions => ({
            secret: configService.getOrThrow<string>("JWT_SECRET"),
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        ...(googleOAuthEnabled ? [GoogleStrategy] : []),
      ],
      exports: [AuthService, JwtModule, PassportModule],
    };
  }
}
