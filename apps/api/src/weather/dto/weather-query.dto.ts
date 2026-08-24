import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class WeatherQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  destination!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  /**
   * Optional JSON-stringified array of itinerary day hints used to align the
   * forecast cards with `ItineraryDay` themes. Validated as an optional string;
   * the controller parses + filters the JSON safely.
   */
  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  itineraryDays?: string;
}