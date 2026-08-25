import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(21)
  @Matches(/^[a-z0-9_]+$/)
  communityName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40000)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^\/uploads\/[a-zA-Z0-9._-]+$/)
  imageUrl?: string;
}
