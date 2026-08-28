import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';
import { UpsertReviewDto } from './dto/review.dto';

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

  @Post(':id/reviews')
  review(
    @CurrentUser() current: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpsertReviewDto,
  ) {
    return this.recs.upsertReview(id, current.sub, current.email.split('@')[0], dto.rating, dto.content);
  }
}
