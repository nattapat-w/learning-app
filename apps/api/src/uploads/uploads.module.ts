import { Module, OnModuleInit } from "@nestjs/common";
import { mkdir } from "fs/promises";
import { UploadsController } from "./uploads.controller";
import { UPLOADS_DIR } from "./uploads.constants";

@Module({
  controllers: [UploadsController],
})
export class UploadsModule implements OnModuleInit {
  async onModuleInit() {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}
