import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { extname, join } from "path";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UPLOADS_DIR } from "./uploads.constants";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@Controller("uploads")
export class UploadsController {
  @Post("image")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
          cb(new BadRequestException("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedImage | undefined) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const ext = extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
    const filename = `${randomUUID()}${safeExt}`;

    await writeFile(join(UPLOADS_DIR, filename), file.buffer);

    return { url: `/uploads/${filename}` };
  }
}
