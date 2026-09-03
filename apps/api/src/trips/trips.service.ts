import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateTripDto } from './dto/trip.dto';
import { UpdateItineraryDto } from './dto/workspace.dto';
import type { TripItineraryInput } from '../ai/ai.types';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateTripDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    if (end < start) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const itineraryInput: TripItineraryInput = {
      destination: dto.destination,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      travelers: dto.travelers,
      budget: dto.budget,
      preferences: dto.preferences ?? '',
    };

    const generated = await this.ai.generateItinerary(itineraryInput);

    const trip = await this.prisma.trip.create({
      data: {
        userId,
        destination: dto.destination,
        startDate: start,
        endDate: end,
        travelers: dto.travelers,
        budget: dto.budget,
        preferences: dto.preferences ?? '',
        status: 'GENERATED',
        itineraries: {
          create: {
            title: generated.title,
            description: generated.summary ?? '',
            content: JSON.stringify(generated),
          },
        },
      },
      include: { itineraries: true },
    });

    await this.notifications.create({
      userId,
      type: 'INFO',
      title: '🎉 Lịch trình đã sẵn sàng!',
      message: `AI đã tạo xong lịch trình ${generated.title || dto.destination} cho bạn.`,
      link: `/trips/${trip.id}`,
    });

    return this.formatTrip(trip);
  }

  async listByUser(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { itineraries: true, expenses: true, packingItems: true },
    });
    return trips.map((trip: NonNullable<Awaited<ReturnType<typeof this.prisma.trip.findFirst>>>) => this.formatTrip(trip));
  }

  async getById(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        itineraries: { orderBy: { createdAt: 'asc' } },
        expenses: { orderBy: { spentAt: 'desc' } },
        packingItems: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not allowed');
    return this.formatTrip(trip);
  }

  async updateItinerary(userId: string, tripId: string, dto: UpdateItineraryDto) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { itineraries: { orderBy: { createdAt: 'asc' } } },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not allowed');
    const itin = trip.itineraries[0];
    if (!itin) throw new NotFoundException('Itinerary not found');
    const serialized = JSON.stringify(dto.content);
    await this.prisma.itinerary.update({
      where: { id: itin.id },
      data: { content: serialized },
    });

    await this.notifications.create({
      userId,
      type: 'INFO',
      title: '✏️ Lịch trình đã được cập nhật',
      message: `Bạn vừa chỉnh sửa lịch trình cho chuyến ${trip.destination}.`,
      link: `/trips/${tripId}`,
    });

    return this.getById(userId, tripId);
  }

  async remove(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not allowed');
    await this.prisma.trip.delete({ where: { id: tripId } });
    return { id: tripId, deleted: true };
  }

  private formatTrip(trip: {
    id: string;
    userId: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    travelers: number;
    budget: number;
    preferences: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    itineraries: Array<{
      id: string;
      title: string;
      description: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    expenses?: Array<{
      id: string;
      title: string;
      category: string;
      amount: number;
      paidBy: string;
      spentAt: Date;
      createdAt: Date;
    }>;
    packingItems?: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      isPacked: boolean;
      createdAt: Date;
    }>;
  }) {
    const itin = trip.itineraries[0];
    const parsedContent: unknown = itin ? safeParse(itin.content) : null;
    return {
      id: trip.id,
      userId: trip.userId,
      destination: trip.destination,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      travelers: trip.travelers,
      budget: trip.budget,
      preferences: trip.preferences,
      status: trip.status,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      itinerary: itin
        ? {
            id: itin.id,
            title: itin.title,
            description: itin.description,
            content: parsedContent,
            createdAt: itin.createdAt.toISOString(),
            updatedAt: itin.updatedAt.toISOString(),
          }
        : null,
      expenses: (trip.expenses ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        amount: e.amount,
        paidBy: e.paidBy,
        spentAt: e.spentAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      packingItems: (trip.packingItems ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        isPacked: p.isPacked,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}

function safeParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
