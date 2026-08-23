import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Post()
  create(@CurrentUser() current: JwtUser, @Body() dto: CreateTripDto) {
    return this.trips.create(current.sub, dto);
  }

  @Get()
  list(@CurrentUser() current: JwtUser) {
    return this.trips.listByUser(current.sub);
  }

  @Get(':id')
  byId(@CurrentUser() current: JwtUser, @Param('id') id: string) {
    return this.trips.getById(current.sub, id);
  }

  @Delete(':id')
  remove(@CurrentUser() current: JwtUser, @Param('id') id: string) {
    return this.trips.remove(current.sub, id);
  }
}
