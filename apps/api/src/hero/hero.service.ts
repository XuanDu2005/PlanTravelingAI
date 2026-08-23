import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero.dto';

/**
 * Public + admin service for managing the hero carousel slides shown on
 * the landing page.
 *
 * The public read should be cheap enough to be called on every render, so
 * we cache the active list for 60s to absorb traffic spikes without
 * hammering the DB.
 */
@Injectable()
export class HeroService {
  private cache: { at: number; data: { id: string; imageUrl: string }[] } | null = null;
  private static readonly CACHE_TTL_MS = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  async listActiveSlides() {
    const now = Date.now();
    if (this.cache && now - this.cache.at < HeroService.CACHE_TTL_MS) {
      return this.cache.data;
    }
    const rows = await this.prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, imageUrl: true },
    });
    this.cache = { at: now, data: rows };
    return rows;
  }

  invalidateCache() {
    this.cache = null;
  }

  listAll() {
    return this.prisma.heroSlide.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  getById(id: string) {
    return this.prisma.heroSlide.findUnique({ where: { id } });
  }

  create(dto: CreateHeroSlideDto) {
    return this.prisma.heroSlide.create({ data: dto }).then((row) => {
      this.invalidateCache();
      return row;
    });
  }

  update(id: string, dto: UpdateHeroSlideDto) {
    return this.prisma.heroSlide.update({ where: { id }, data: dto }).then((row) => {
      this.invalidateCache();
      return row;
    });
  }

  remove(id: string) {
    return this.prisma.heroSlide.delete({ where: { id } }).then((row) => {
      this.invalidateCache();
      return row;
    });
  }

  /**
   * Move a slide one slot up (direction='up') or down. Re-numbers the
   * touched neighbours so ordering remains unique-by-swap, which is the
   * simplest invariant for a small admin UI.
   */
  async move(id: string, direction: 'up' | 'down') {
    const rows = await this.prisma.heroSlide.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, sortOrder: true },
    });
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= rows.length) {
      // Already at the boundary; nothing to do.
      return this.prisma.heroSlide.findUnique({ where: { id } });
    }
    const a = rows[idx];
    const b = rows[swapIdx];
    // Two-step update keeps the unique-only relative order without
    // colliding on (isActive, sortOrder) — bump an interim sentinel.
    await this.prisma.$transaction([
      this.prisma.heroSlide.update({ where: { id: a.id }, data: { sortOrder: -1 } }),
      this.prisma.heroSlide.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
      this.prisma.heroSlide.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    ]);
    this.invalidateCache();
    return this.prisma.heroSlide.findUnique({ where: { id } });
  }
}
