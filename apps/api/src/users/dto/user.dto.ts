import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 80, { message: 'name must be between 2 and 80 characters' })
  name?: string;

  @IsOptional()
  @IsIn(['vi', 'en'], { message: 'language must be vi or en' })
  language?: 'vi' | 'en';

  /**
   * User-supplied avatar. Accepts either an http(s) URL or a `data:image/...`
   * base64 payload. An empty string is allowed (clears the avatar). Capped
   * at ~2MB to mirror the Express body limit (a 1MB image is ~1.4MB as
   * base64).
   */
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000, { message: 'avatar is too large' })
  @Matches(/(^(https?:\/\/.+|data:image\/[a-zA-Z0-9+.-]+;base64,)|^$)/, {
    message: 'avatar must be an http(s) URL, a data:image base64 string, or empty',
  })
  avatar?: string;
}

export class ChangePasswordDto {
  @IsString()
  @Length(1, 200)
  currentPassword?: string;

  @IsString()
  @Length(8, 200, { message: 'new password must be at least 8 characters' })
  @Matches(/[A-Za-z]/, { message: 'password must contain a letter' })
  @Matches(/[0-9]/, { message: 'password must contain a number' })
  newPassword?: string;
}