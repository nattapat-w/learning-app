import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateCommunityDto {
  @IsString()
  @MinLength(3)
  @MaxLength(21)
  @Matches(/^[a-z0-9_]+$/, {
    message: "name must be lowercase letters, numbers, or underscores",
  })
  name!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
