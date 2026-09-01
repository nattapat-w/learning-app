import { Injectable } from "@nestjs/common";
import { PrismaService } from "./common/prisma/prisma.service";

export type HealthStatus = {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  gitCommit?: string;
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return "Hello from Nest API!";
  }

  async getHealth(): Promise<HealthStatus> {
    const dbOk = await this.prisma.isHealthy();
    return {
      status: dbOk ? "ok" : "degraded",
      database: dbOk ? "connected" : "disconnected",
      gitCommit: process.env.RENDER_GIT_COMMIT,
    };
  }
}
