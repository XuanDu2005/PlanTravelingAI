import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { AuthModule } from '../auth/auth.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [AuthModule, RecommendationsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
