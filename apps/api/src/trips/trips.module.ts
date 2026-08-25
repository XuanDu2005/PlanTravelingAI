import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { PackingController } from './packing.controller';
import { PackingService } from './packing.service';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AiModule, AuthModule, NotificationsModule],
  controllers: [TripsController, ExpensesController, PackingController],
  providers: [TripsService, ExpensesService, PackingService],
  exports: [TripsService, ExpensesService, PackingService],
})
export class TripsModule {}