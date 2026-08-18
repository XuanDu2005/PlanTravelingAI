import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recs: RecommendationsService,
  ) {}

  async getDashboardStats() {
    const [users, trips, recommendations, publishedRecommendations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.trip.count(),
      this.prisma.recommendation.count(),
      this.prisma.recommendation.count({ where: { isPublished: true } }),
    ]);
    return {
      totalUsers: users,
      totalTrips: trips,
      totalRecommendations: recommendations,
      publishedRecommendations,
    };
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  listRecommendations() {
    return this.recs.listAll();
  }

  /**
   * List all trips across all users (admin only). Includes a lightweight user
   * projection so the admin UI can display the owner without a second round-trip.
   */
  listTrips() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Aggregate analytics for the admin dashboard. Returns counts, monthly
   * timeseries for the last 6 months, category distribution, top destinations,
   * and a recent-activity feed.
   */
  async getAnalytics() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      users,
      trips,
      recommendations,
      publishedRecommendations,
      favorites,
      lockedUsers,
      tripsRows,
      recCategories,
      topTripDestinations,
      recentTrips,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.trip.count(),
      this.prisma.recommendation.count(),
      this.prisma.recommendation.count({ where: { isPublished: true } }),
      this.prisma.favorite.count(),
      this.prisma.user.count({ where: { status: 'LOCKED' } }),
      // Pull createdAt of trips in window for monthly bucketing.
      this.prisma.trip.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      this.prisma.recommendation.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.trip.groupBy({
        by: ['destination'],
        _count: { _all: true },
        orderBy: { _count: { destination: 'desc' } },
        take: 5,
      }),
      this.prisma.trip.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

    // Build a 6-bucket timeseries keyed by 'YYYY-MM' so the frontend can
    // simply render the array in order. Months with 0 trips render as 0.
    const monthlyTrips = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
      const count = tripsRows.filter((row) => {
        const rd = row.createdAt;
        return (
          rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
        );
      }).length;
      return { key, label, count };
    });

    return {
      totals: {
        users,
        trips,
        recommendations,
        publishedRecommendations,
        favorites,
        lockedUsers,
      },
      monthlyTrips,
      recsByCategory: recCategories.map((c) => ({
        category: c.category,
        count: c._count._all,
      })),
      topTripDestinations: topTripDestinations.map((d) => ({
        destination: d.destination,
        count: d._count._all,
      })),
      recentTrips: recentTrips.map((t) => ({
        id: t.id,
        destination: t.destination,
        createdAt: t.createdAt.toISOString(),
        user: t.user,
      })),
      recentSignups: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }

  async deleteTrip(id: string) {
    const existing = await this.prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return { id, deleted: false };
    }
    await this.prisma.trip.delete({ where: { id } });
    return { id, deleted: true };
  }

  /**
   * Permanently delete a user. Trips, favorites and chat sessions cascade away
   * with the user thanks to the Prisma onDelete rules.
   *
   * Guards:
   *  - target must exist
   *  - admins cannot delete themselves
   *  - the last remaining admin cannot be deleted (system would be unmanageable)
   */
  async deleteUser(targetId: string, currentUserId: string) {
    if (targetId === currentUserId) {
      throw new BadRequestException('Bạn không thể tự xoá tài khoản của mình.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) {
      return { id: targetId, deleted: false };
    }

    if (target.role === 'ADMIN') {
      const remainingAdmins = await this.prisma.user.count({
        where: { role: 'ADMIN', NOT: { id: targetId } },
      });
      if (remainingAdmins === 0) {
        throw new BadRequestException('Không thể xoá admin cuối cùng của hệ thống.');
      }
    }

    await this.prisma.user.delete({ where: { id: targetId } });
    return { id: targetId, deleted: true };
  }

  /**
   * Toggle a user's account status (ACTIVE <-> LOCKED). Optional reason is
   * stored verbatim but not yet persisted (no lock-records table) — kept for
   * future audit + current UX only.
   *
   * Guards:
   *  - target must exist
   *  - admins cannot lock themselves
   *  - the last remaining admin cannot be locked
   */
  async setUserStatus(
    targetId: string,
    currentUserId: string,
    status: 'ACTIVE' | 'LOCKED',
    reason?: string,
  ) {
    if (targetId === currentUserId) {
      throw new BadRequestException('Bạn không thể tự khoá tài khoản của mình.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, status: true },
    });
    if (!target) {
      return { id: targetId, status: null, updated: false };
    }

    if (status === 'LOCKED' && target.role === 'ADMIN') {
      const remainingActiveAdmins = await this.prisma.user.count({
        where: { role: 'ADMIN', status: 'ACTIVE', NOT: { id: targetId } },
      });
      if (remainingActiveAdmins === 0) {
        throw new BadRequestException('Không thể khoá admin cuối cùng đang hoạt động của hệ thống.');
      }
    }

    if (target.status === status) {
      return { id: targetId, status, updated: false, reason: reason ?? null };
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { status },
    });
    return { id: targetId, status, updated: true, reason: reason ?? null };
  }

  createRecommendation(dto: import('../recommendations/dto/recommendation.dto').CreateRecommendationDto) {
    return this.recs.create(dto);
  }

  updateRecommendation(
    id: string,
    dto: import('../recommendations/dto/recommendation.dto').UpdateRecommendationDto,
  ) {
    return this.recs.update(id, dto);
  }

  publishRecommendation(id: string) {
    return this.recs.setPublished(id, true);
  }

  unpublishRecommendation(id: string) {
    return this.recs.setPublished(id, false);
  }

  deleteRecommendation(id: string) {
    return this.recs.remove(id);
  }
}
