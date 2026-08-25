import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { UPLOADS_DIR } from "./uploads/uploads.constants";

function getCorsOrigins(): string[] | boolean {
  const webUrl = process.env.WEB_URL?.replace(/\/$/, "");
  const extra = process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const origins = new Set<string>(["http://localhost:3000", ...extra]);
  if (webUrl) {
    origins.add(webUrl);
  }

  return origins.size > 0 ? [...origins] : true;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useStaticAssets(UPLOADS_DIR, { prefix: "/uploads/" });

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
}

bootstrap();
