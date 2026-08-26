import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

function getCorsOrigins():
  | string[]
  | boolean
  | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  const webUrl = process.env.WEB_URL?.replace(/\/$/, "");
  const extra =
    process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const allowed = new Set<string>(["http://localhost:3000", ...extra]);
  if (webUrl) {
    allowed.add(webUrl);
  }

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowed.has(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

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
  await app.listen(port, "0.0.0.0");
}

bootstrap();
