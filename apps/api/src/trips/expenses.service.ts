import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/workspace.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(userId: string, tripId: string) {
    await this.assertOwner(userId, tripId);
    return this.prisma.expense.findMany({
      where: { tripId },
      orderBy: { spentAt: 'desc' },
    });
  }

  async create(userId: string, tripId: string, dto: CreateExpenseDto) {
    const trip = await this.assertOwner(userId, tripId);
    const expense = await this.prisma.expense.create({
      data: {
        tripId,
        title: dto.title.trim(),
        category: dto.category.trim(),
        amount: dto.amount,
        paidBy: dto.paidBy?.trim() ?? '',
        spentAt: dto.spentAt ? new Date(dto.spentAt) : new Date(),
      },
    });
    await this.notifications.create({
      userId,
      type: 'INFO',
      title: '💸 Đã ghi nhận chi phí mới',
      message: `${expense.title} · ${expense.amount.toLocaleString('vi-VN')}đ đã được thêm vào chuyến ${trip.destination}.`,
      link: `/trips/${tripId}`,
    });
    return expense;
  }

  async remove(userId: string, tripId: string, expenseId: string) {
    await this.assertOwner(userId, tripId);
    const item = await this.prisma.expense.findUnique({ where: { id: expenseId } });
    if (!item || item.tripId !== tripId) throw new NotFoundException('Expense not found');
    await this.prisma.expense.delete({ where: { id: expenseId } });
    return { ok: true };
  }

  private async assertOwner(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not allowed');
    return trip;
  }
}