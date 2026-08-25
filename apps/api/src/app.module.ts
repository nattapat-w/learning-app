import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CommunitiesModule } from "./communities/communities.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { PostsModule } from "./posts/posts.module";
import { SearchModule } from "./search/search.module";
import { UsersModule } from "./users/users.module";
import { VotesModule } from "./votes/votes.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CommunitiesModule,
    PostsModule,
    SearchModule,
    VotesModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
