import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() current: JwtUser) {
    return this.users.getMe(current.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() current: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(current.sub, dto);
  }

  @Post('me/password')
  changePassword(@CurrentUser() current: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(current.sub, dto);
  }

  @Get('me/notifications')
  notifications(@CurrentUser() current: JwtUser) {
    return this.users.listNotifications(current.sub);
  }

  @Patch('me/notifications/read-all')
  readAllNotifications(@CurrentUser() current: JwtUser) {
    return this.users.markAllNotificationsRead(current.sub);
  }

  @Patch('me/notifications/:id/read')
  readNotification(@CurrentUser() current: JwtUser, @Param('id') id: string) {
    return this.users.markNotificationRead(current.sub, id);
  }
}
