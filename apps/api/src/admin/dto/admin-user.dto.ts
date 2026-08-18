import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetUserStatusDto {
  @IsIn(['ACTIVE', 'LOCKED'], { message: 'status must be ACTIVE or LOCKED' })
  status!: 'ACTIVE' | 'LOCKED';

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'reason is too long' })
  reason?: string;
}
