import { Module } from "@nestjs/common";
import { VotesModule } from "../votes/votes.module";
import { CommentsService } from "./comments.service";

@Module({
  imports: [VotesModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
