import { Module } from '@nestjs/common';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HeroController],
  providers: [HeroService],
  exports: [HeroService],
})
export class HeroModule {}
