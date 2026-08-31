import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MinLength(2)
  destination!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  travelers!: number;

  /**
   * Raw budget amount in VND (e.g. 5000000 for 5 million). Frontend must send
   * the raw integer, not a formatted string. Bounds are wide enough to cover
   * anything from a backpacker weekend to a luxury week-long trip.
   */
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  budget!: number;

  @IsOptional()
  @IsString()
  preferences?: string;
}
