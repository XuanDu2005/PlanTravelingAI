import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';
import {
  CreateRecommendationDto,
  UpdateRecommendationDto,
} from '../recommendations/dto/recommendation.dto';
import { SetUserStatusDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.getDashboardStats();
  }

  @Get('analytics')
  analytics() {
    return this.admin.getAnalytics();
  }

  @Get('users')
  users() {
    return this.admin.listUsers();
  }

  @Get('recommendations')
  recommendations() {
    return this.admin.listRecommendations();
  }

  @Get('trips')
  trips() {
    return this.admin.listTrips();
  }

  @Delete('trips/:id')
  deleteTrip(@Param('id') id: string) {
    return this.admin.deleteTrip(id);
  }

  @Delete('users/:id')
  deleteUser(
    @Param('id') id: string,
    @CurrentUser() current: JwtUser,
  ) {
    return this.admin.deleteUser(id, current.sub);
  }

  @Patch('users/:id/status')
  setUserStatus(
    @Param('id') id: string,
    @Body() dto: SetUserStatusDto,
    @CurrentUser() current: JwtUser,
  ) {
    return this.admin.setUserStatus(id, current.sub, dto.status, dto.reason);
  }

  @Post('recommendations')
  createRecommendation(@Body() dto: CreateRecommendationDto) {
    return this.admin.createRecommendation(dto);
  }

  @Patch('recommendations/:id')
  updateRecommendation(@Param('id') id: string, @Body() dto: UpdateRecommendationDto) {
    return this.admin.updateRecommendation(id, dto);
  }

  @Patch('recommendations/:id/publish')
  publish(@Param('id') id: string) {
    return this.admin.publishRecommendation(id);
  }

  @Delete('recommendations/:id')
  remove(@Param('id') id: string) {
    return this.admin.deleteRecommendation(id);
  }
}
