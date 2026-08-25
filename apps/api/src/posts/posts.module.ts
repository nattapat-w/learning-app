import { Module } from "@nestjs/common";
import { CommentsModule } from "../comments/comments.module";
import { VotesModule } from "../votes/votes.module";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  imports: [CommentsModule, VotesModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
