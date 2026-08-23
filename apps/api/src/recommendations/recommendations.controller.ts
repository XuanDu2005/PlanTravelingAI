import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recs: RecommendationsService) {}

  @Public()
  @Get()
  list() {
    return this.recs.listPublic();
  }

  @Public()
  @Get(':id')
  byId(@Param('id') id: string) {
    return this.recs.getPublic(id);
  }
}
