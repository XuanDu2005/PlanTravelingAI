import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackingItemDto, UpdatePackingItemDto } from './dto/workspace.dto';
import { AiService } from '../ai/ai.service';
import { buildBasicPackingList } from '../ai/providers/basic-packing';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PackingService {
  private readonly logger = new Logger('PackingService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(userId: string, tripId: string) {
    await this.assertOwner(userId, tripId);
    return this.prisma.packingItem.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, tripId: string, dto: CreatePackingItemDto) {
    await this.assertOwner(userId, tripId);
    return this.prisma.packingItem.create({
      data: {
        tripId,
        name: dto.name.trim(),
        category: dto.category?.trim() ?? 'Khác',
        quantity: dto.quantity ?? 1,
      },
    });
  }

  async generate(userId: string, tripId: string, ai: AiService) {
    const trip = await this.assertOwner(userId, tripId);
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const daysCount = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
    let suggestions = await ai.generatePackingList({
      destination: trip.destination,
      daysCount,
      travelers: trip.travelers,
      preferences: trip.preferences,
    });

    // Last-resort safety net: if every provider path returned nothing
    // (e.g. invalid Gemini key + unparseable response), fall back to the
    // static basic checklist so the user always gets a usable list.
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      this.logger.warn(
        `AI returned empty packing suggestions, falling back to basic checklist for trip ${tripId}`,
      );
      suggestions = buildBasicPackingList({
        destination: trip.destination,
        daysCount,
        travelers: trip.travelers,
        preferences: trip.preferences,
      });
    }

    await this.prisma.packingItem.deleteMany({ where: { tripId } });
    const items = await this.prisma.$transaction(
      suggestions.map((s) =>
        this.prisma.packingItem.create({
          data: {
            tripId,
            name: s.name,
            category: s.category || 'Khác',
            quantity: s.quantity,
          },
        }),
      ),
    );

    await this.notifications.create({
      userId,
      type: 'INFO',
      title: '🧳 Đã tạo checklist đồ đạp',
      message: `AI đã gợi ý ${items.length} món cần chuẩn bị cho chuyến ${trip.destination}.`,
      link: `/trips/${tripId}`,
    });

    return { created: items.length, items };
  }

  async update(userId: string, tripId: string, itemId: string, dto: UpdatePackingItemDto) {
    await this.assertOwner(userId, tripId);
    const item = await this.prisma.packingItem.findUnique({ where: { id: itemId } });
    if (!item || item.tripId !== tripId) throw new NotFoundException('Packing item not found');
    return this.prisma.packingItem.update({
      where: { id: itemId },
      data: {
        isPacked: dto.isPacked ?? undefined,
        quantity: dto.quantity ?? undefined,
      },
    });
  }

  async remove(userId: string, tripId: string, itemId: string) {
    await this.assertOwner(userId, tripId);
    const item = await this.prisma.packingItem.findUnique({ where: { id: itemId } });
    if (!item || item.tripId !== tripId) throw new NotFoundException('Packing item not found');
    await this.prisma.packingItem.delete({ where: { id: itemId } });
    return { ok: true };
  }

  private async assertOwner(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not allowed');
    return trip;
  }
}