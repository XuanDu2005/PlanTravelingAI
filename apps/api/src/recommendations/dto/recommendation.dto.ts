import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export enum RecCategoryEnum {
  NATURE = 'NATURE',
  CULTURE = 'CULTURE',
  RESORT = 'RESORT',
  ADVENTURE = 'ADVENTURE',
  BEACH = 'BEACH',
}

export class CreateRecommendationDto {
  @IsString() @MinLength(2) title!: string;
  @IsString() @MinLength(2) description!: string;
  @IsString() @MinLength(2) destination!: string;
  @IsOptional() @IsString() image?: string;
  @IsString() content!: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsEnum(RecCategoryEnum) category?: RecCategoryEnum;
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsInt() @Min(0) reviewCount?: number;
  @IsOptional() @IsInt() @Min(1) minTravelers?: number;
  @IsOptional() @IsInt() @Min(1) maxTravelers?: number;
}

export class UpdateRecommendationDto {
  @IsOptional() @IsString() @MinLength(2) title?: string;
  @IsOptional() @IsString() @MinLength(2) description?: string;
  @IsOptional() @IsString() @MinLength(2) destination?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsEnum(RecCategoryEnum) category?: RecCategoryEnum;
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsInt() @Min(0) reviewCount?: number;
  @IsOptional() @IsInt() @Min(1) minTravelers?: number;
  @IsOptional() @IsInt() @Min(1) maxTravelers?: number;
}
