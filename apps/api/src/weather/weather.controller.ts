import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WeatherService } from './weather.service';
import { WeatherQueryDto } from './dto/weather-query.dto';
import type { WeatherForecastResponse } from './dto/weather-response.dto';

interface ItineraryDayHint {
  day: number;
  date: string;
  theme: string;
}

@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  /**
   * GET /api/weather?destination=Da Nang&startDate=2026-09-01&endDate=2026-09-05
   * Returns a daily forecast plus rule-based advice for each day.
   */
  @Get()
  forecast(
    @Query() query: WeatherQueryDto,
    @Query('itineraryDays') itineraryDaysJson?: string,
  ): Promise<WeatherForecastResponse> {
    let itineraryDays: ItineraryDayHint[] | undefined;
    if (itineraryDaysJson) {
      try {
        const parsed = JSON.parse(itineraryDaysJson);
        if (Array.isArray(parsed)) {
          itineraryDays = parsed.filter(
            (d): d is ItineraryDayHint =>
              typeof d === 'object' &&
              d !== null &&
              typeof d.day === 'number' &&
              typeof d.date === 'string' &&
              typeof d.theme === 'string',
          );
        }
      } catch {
        // Ignore malformed JSON; service falls back to no alignment.
      }
    }

    return this.weather.getForecast(
      query.destination,
      query.startDate,
      query.endDate,
      itineraryDays,
    );
  }
}