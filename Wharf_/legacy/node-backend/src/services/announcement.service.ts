import prisma from '../db';
import { AnnouncementType } from '@prisma/client';

export class AnnouncementService {
  // Admin Methods
  async createAnnouncement(data: {
    title: string;
    message: string;
    type: AnnouncementType;
    expiresAt?: Date;
    isPublished?: boolean;
    isPinned?: boolean;
  }) {
    return prisma.announcement.create({
      data: {
        ...data,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });
  }

  async updateAnnouncement(id: string, data: any) {
    return prisma.announcement.update({
      where: { id },
      data,
    });
  }

  async togglePublish(id: string, isPublished: boolean) {
    return prisma.announcement.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
  }

  async deleteAnnouncement(id: string) {
    return prisma.announcement.delete({
      where: { id },
    });
  }

  async getAllAdminAnnouncements() {
    return prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reads: true },
        },
      },
    });
  }

  // User Methods
  async getUserNotifications(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip,
      take: limit,
      include: {
        reads: {
          where: { userId },
          select: { readAt: true },
        },
      },
    });

    // Transform Nested Array Output Into Boolean Readable Value
    return announcements.map((a: any) => {
      const isRead = a.reads.length > 0;
      const { reads, ...rest } = a;
      return { ...rest, isRead };
    });
  }

  async getUnreadCount(userId: string) {
    const now = new Date();
    return prisma.announcement.count({
      where: {
        isPublished: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        reads: {
          none: { userId },
        },
      },
    });
  }

  async markAsRead(userId: string, announcementId: string) {
    return prisma.announcementRead.upsert({
      where: {
        userId_announcementId: { userId, announcementId },
      },
      update: {},
      create: { userId, announcementId },
    });
  }

  async markAllAsRead(userId: string) {
    const now = new Date();
    const unread = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unread.length === 0) return { count: 0 };

    const created = await prisma.announcementRead.createMany({
      data: unread.map((a: any) => ({
        userId,
        announcementId: a.id,
      })),
      skipDuplicates: true,
    });

    return created;
  }
}

export const announcementService = new AnnouncementService();
