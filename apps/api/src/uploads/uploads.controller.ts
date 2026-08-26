import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { memoryStorage } from "multer";
import { extname, join } from "path";
import type { Response } from "express";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UPLOADS_DIR } from "./uploads.constants";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/octet-stream",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

function isAllowedImage(file: { mimetype: string; originalname: string }): boolean {
  if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    const ext = extname(file.originalname).toLowerCase();
    if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
      return false;
    }
    return true;
  }
  const ext = extname(file.originalname).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

@Controller("uploads")
export class UploadsController {
  @Post("image")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!isAllowedImage(file)) {
          cb(
            new BadRequestException("Only JPEG, PNG, GIF, and WebP images are allowed"),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedImage | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("No file uploaded");
    }

    const ext = extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
    const filename = `${randomUUID()}${safeExt}`;

    await writeFile(join(UPLOADS_DIR, filename), file.buffer);

    return { url: `/uploads/${filename}` };
  }

  /** Serve uploaded files (Nest static middleware order is unreliable). */
  @Get(":filename")
  serveImage(@Param("filename") filename: string, @Res() res: Response) {
    if (!filename || filename === "image" || !SAFE_FILENAME.test(filename)) {
      throw new NotFoundException();
    }

    const path = join(UPLOADS_DIR, filename);
    if (!existsSync(path)) {
      throw new NotFoundException();
    }

    return res.sendFile(path);
  }
}
