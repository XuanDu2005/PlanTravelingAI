import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  language: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: { name?: string; language?: 'vi' | 'en'; avatar?: string } = {};
    if (typeof dto.name === 'string') {
      const trimmed = dto.name.trim();
      if (trimmed.length < 2) {
        throw new BadRequestException('name is too short');
      }
      data.name = trimmed;
    }
    if (dto.language === 'vi' || dto.language === 'en') {
      data.language = dto.language;
    }
    if (typeof dto.avatar === 'string') {
      data.avatar = dto.avatar;
    }
    if (Object.keys(data).length === 0) {
      return this.getMe(userId);
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: PROFILE_SELECT,
    });
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { ok: true };
  }
}