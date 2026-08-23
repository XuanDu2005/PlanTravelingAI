import { IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

export class CreateHeroSlideDto {
  @IsString()
  @MaxLength(2000, { message: 'imageUrl is too long' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'imageUrl must be a valid http(s) URL' },
  )
  imageUrl!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateHeroSlideDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'imageUrl is too long' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'imageUrl must be a valid http(s) URL' },
  )
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}
