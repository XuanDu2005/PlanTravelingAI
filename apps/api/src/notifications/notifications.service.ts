import { Injectable, Logger } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationInput {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a single notification. Errors are swallowed and logged so that a
   * notification failure never breaks the surrounding business flow.
   */
  async create(input: CreateNotificationInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type ?? 'INFO',
          title: input.title,
          message: input.message,
          link: input.link ?? '',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to create notification: ${message}`);
    }
  }

  /**
   * Bulk-create notifications. Same error-tolerance semantics as create().
   */
  async createMany(inputs: CreateNotificationInput[]): Promise<void> {
    if (!inputs.length) return;
    try {
      await this.prisma.notification.createMany({
        data: inputs.map((input) => ({
          userId: input.userId,
          type: input.type ?? 'INFO',
          title: input.title,
          message: input.message,
          link: input.link ?? '',
        })),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to bulk-create notifications: ${message}`);
    }
  }
}