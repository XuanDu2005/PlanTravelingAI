import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpsertReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(1200)
  content!: string;
}
