import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TripsModule } from './trips/trips.module';
import { AiModule } from './ai/ai.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { FavoritesModule } from './favorites/favorites.module';
import { HeroModule } from './hero/hero.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TripsModule,
    AiModule,
    RecommendationsModule,
    AdminModule,
    ChatModule,
    FavoritesModule,
    HeroModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
