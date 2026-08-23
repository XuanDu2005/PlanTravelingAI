import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recs: RecommendationsService,
  ) {}

  /**
   * List the user's favorited recommendations, newest favorite first.
   * Returns the full RecommendationSummary shape so the client can render
   * the same card as on the discover page.
   */
  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        recommendation: true,
      },
    });

    // Filter out favorites whose recommendation was deleted (admin removed).
    const visible = favorites.filter((f) => f.recommendation != null);
    return visible.map((f) => this.recs.formatSummary(f.recommendation));
  }

  /**
   * Returns the set of recommendation IDs the user has favorited.
   * Used for cheap hydration of the heart icon state on list pages.
   */
  async listIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      select: { recommendationId: true },
    });
    return rows.map((r) => r.recommendationId);
  }

  async add(userId: string, recommendationId: string) {
    const rec = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
      select: { id: true, isPublished: true },
    });
    if (!rec || !rec.isPublished) {
      throw new NotFoundException('Recommendation not found');
    }

    // upsert via unique constraint (userId, recommendationId) — id is idempotent.
    await this.prisma.favorite.upsert({
      where: { userId_recommendationId: { userId, recommendationId } },
      create: { userId, recommendationId },
      update: {},
    });

    return { recommendationId, favorite: true };
  }

  async remove(userId: string, recommendationId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId, recommendationId },
    });
    return { recommendationId, favorite: false };
  }
}
