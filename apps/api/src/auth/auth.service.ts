import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../common/guards/jwt-auth.guard';
import { AccountLockedException } from '../common/exceptions/account-locked.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email: normalizedEmail, password: hash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return this.buildAuthResult(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        language: true,
        password: true,
        status: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Surface a typed exception so the frontend can render a "locked" banner
    // instead of a generic "invalid credentials" toast.
    if (user.status !== 'ACTIVE') {
      throw new AccountLockedException();
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.buildAuthResult(user.id, user.email, user.role, {
      name: user.name,
      avatar: user.avatar,
      language: user.language,
    });
  }

  private async buildAuthResult(
    userId: string,
    email: string,
    role: 'USER' | 'ADMIN',
    extra: Record<string, unknown> = {},
  ) {
    const payload: JwtUser = { sub: userId, email, role };
    const token = await this.jwt.signAsync(payload);
    return {
      accessToken: token,
      user: { id: userId, email, role, ...extra },
    };
  }
}
