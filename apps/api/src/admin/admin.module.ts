import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [RecommendationsModule, AuthModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AdminModule {}
