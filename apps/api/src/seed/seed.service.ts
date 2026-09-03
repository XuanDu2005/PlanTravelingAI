import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

interface SeedAccount {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    name: 'Test User',
    email: 'user@travelmind.local',
    password: 'User@12345',
    role: 'USER',
  },
  {
    name: 'Test Admin',
    email: 'admin@travelmind.local',
    password: 'Admin@12345',
    role: 'ADMIN',
  },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    // Allow opting out via env (e.g. for staging with real users).
    if (this.config.get<string>('SEED_ACCOUNTS') === 'false') {
      this.logger.log('Seed skipped (SEED_ACCOUNTS=false)');
      return;
    }

    for (const account of SEED_ACCOUNTS) {
      try {
        const existing = await this.prisma.user.findUnique({
          where: { email: account.email },
        });
        if (existing) {
          this.logger.log(`✓ ${account.role} already exists: ${account.email}`);
          continue;
        }

        const hash = await bcrypt.hash(account.password, 10);
        await this.prisma.user.create({
          data: {
            name: account.name,
            email: account.email,
            password: hash,
            role: account.role,
            language: 'vi',
            avatar: '',
          },
        });
        this.logger.log(
          `✓ Seeded ${account.role}: ${account.email} / ${account.password}`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to seed ${account.email}: ${(err as Error).message}`,
        );
      }
    }
  }
}
