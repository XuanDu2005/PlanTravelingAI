import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

export class UpdateSessionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;
}
