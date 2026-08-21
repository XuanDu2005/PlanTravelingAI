import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

class GenerateItineraryDto {
  @IsString() destination!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsInt() @Min(1) travelers!: number;
  @IsString() budget!: string;
  @IsOptional() @IsString() preferences?: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateItineraryDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    if (end < start) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
    return this.ai.generateItinerary({
      destination: dto.destination,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      travelers: dto.travelers,
      budget: dto.budget,
      preferences: dto.preferences ?? '',
    });
  }
}
