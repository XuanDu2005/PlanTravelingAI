import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
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
}
