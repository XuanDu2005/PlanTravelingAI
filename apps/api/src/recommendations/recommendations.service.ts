import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRecommendationDto,
  UpdateRecommendationDto,
} from './dto/recommendation.dto';

type RecRow = {
  id: string;
  title: string;
  description: string;
  destination: string;
  image: string;
  content: string;
  isPublished: boolean;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic() {
    const recs = await this.prisma.recommendation.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    return recs.map((r) => this.formatSummary(r));
  }

  async getPublic(id: string) {
    const rec = await this.prisma.recommendation.findFirst({
      where: { id, isPublished: true },
    });
    if (!rec) throw new NotFoundException('Recommendation not found');
    return this.formatDetail(rec);
  }

  async listAll() {
    const recs = await this.prisma.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return recs.map((r) => this.formatSummary(r));
  }

  async create(dto: CreateRecommendationDto) {
    const rec = await this.prisma.recommendation.create({
      data: {
        title: dto.title,
        description: dto.description,
        destination: dto.destination,
        image: dto.image ?? '',
        content: dto.content,
        isPublished: dto.isPublished ?? false,
        category: dto.category ?? 'NATURE',
        price: dto.price ?? 0,
        rating: dto.rating ?? 4.5,
        reviewCount: dto.reviewCount ?? 0,
      },
    });
    return this.formatDetail(rec);
  }

  async update(id: string, dto: UpdateRecommendationDto) {
    const exists = await this.prisma.recommendation.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Recommendation not found');
    const rec = await this.prisma.recommendation.update({
      where: { id },
      data: {
        title: dto.title ?? exists.title,
        description: dto.description ?? exists.description,
        destination: dto.destination ?? exists.destination,
        image: dto.image ?? exists.image,
        content: dto.content ?? exists.content,
        isPublished: dto.isPublished ?? exists.isPublished,
        category: dto.category ?? exists.category,
        price: dto.price ?? exists.price,
        rating: dto.rating ?? exists.rating,
        reviewCount: dto.reviewCount ?? exists.reviewCount,
      },
    });
    return this.formatDetail(rec);
  }

  async remove(id: string) {
    const exists = await this.prisma.recommendation.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Recommendation not found');
    await this.prisma.recommendation.delete({ where: { id } });
    return { id, deleted: true };
  }

  async setPublished(id: string, isPublished: boolean) {
    const exists = await this.prisma.recommendation.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Recommendation not found');
    const rec = await this.prisma.recommendation.update({
      where: { id },
      data: { isPublished },
    });
    return this.formatDetail(rec);
  }

  formatSummary(rec: RecRow) {
    return {
      id: rec.id,
      title: rec.title,
      description: rec.description,
      destination: rec.destination,
      image: rec.image,
      isPublished: rec.isPublished,
      category: rec.category,
      price: rec.price,
      rating: rec.rating,
      reviewCount: rec.reviewCount,
      daysCount: this.parseDaysCount(rec.content),
      createdAt: rec.createdAt.toISOString(),
      updatedAt: rec.updatedAt.toISOString(),
    };
  }

  private parseDaysCount(content: string): number {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.days)) {
        return parsed.days.length;
      }
    } catch {
      /* ignore */
    }
    return 0;
  }

  private formatDetail(rec: RecRow) {
    let parsedContent: unknown = null;
    try {
      parsedContent = JSON.parse(rec.content);
    } catch {
      parsedContent = null;
    }
    return {
      ...this.formatSummary(rec),
      content: parsedContent ?? rec.content,
      daysCount: this.parseDaysCount(rec.content),
    };
  }
}