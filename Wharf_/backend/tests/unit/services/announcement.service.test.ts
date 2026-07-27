import { announcementService } from '../../../src/services/announcement.service';
import prisma from '../../../src/db';
import { AnnouncementType } from '@prisma/client';

jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    announcement: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    announcementRead: {
      upsert: jest.fn(),
      createMany: jest.fn(),
    }
  }
}));

describe('AnnouncementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Methods', () => {
    it('should create an announcement', async () => {
      (prisma.announcement.create as jest.Mock).mockResolvedValue({ id: 'a-1' });

      const res = await announcementService.createAnnouncement({
        title: 'T1', message: 'M1', type: 'FEATURE' as AnnouncementType, isPublished: true
      });

      expect(res.id).toBe('a-1');
      expect(prisma.announcement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ title: 'T1', isPublished: true, publishedAt: expect.any(Date) })
      });
    });

    it('should toggle publish status', async () => {
      await announcementService.togglePublish('a-1', false);
      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: 'a-1' },
        data: { isPublished: false, publishedAt: null }
      });
    });

    it('should delete an announcement', async () => {
      await announcementService.deleteAnnouncement('a-1');
      expect(prisma.announcement.delete).toHaveBeenCalledWith({ where: { id: 'a-1' } });
    });
  });

  describe('User Methods', () => {
    it('should transform user notifications and attach isRead flag properly', async () => {
      (prisma.announcement.findMany as jest.Mock).mockResolvedValue([
        { id: '1', title: 'A1', reads: [] },
        { id: '2', title: 'A2', reads: [{ readAt: new Date() }] }
      ]);

      const res = await announcementService.getUserNotifications('u-1');
      expect(res).toEqual([
        { id: '1', title: 'A1', isRead: false },
        { id: '2', title: 'A2', isRead: true },
      ]);
    });

    it('should get unread count correctly', async () => {
      (prisma.announcement.count as jest.Mock).mockResolvedValue(4);
      const res = await announcementService.getUnreadCount('u-1');
      expect(res).toBe(4);
      expect(prisma.announcement.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isPublished: true })
      }));
    });

    it('should mark all as read by looking up unread array first', async () => {
      (prisma.announcement.findMany as jest.Mock).mockResolvedValue([{ id: 'un-1' }, { id: 'un-2' }]);
      (prisma.announcementRead.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const res = await announcementService.markAllAsRead('u-1');
      expect(res).toEqual({ count: 2 });
      expect(prisma.announcementRead.createMany).toHaveBeenCalledWith({
        skipDuplicates: true,
        data: [
          { userId: 'u-1', announcementId: 'un-1' },
          { userId: 'u-1', announcementId: 'un-2' }
        ]
      });
    });

    it('should handle mark all read when 0 unread', async () => {
      (prisma.announcement.findMany as jest.Mock).mockResolvedValue([]);
      const res = await announcementService.markAllAsRead('u-1');
      expect(res).toEqual({ count: 0 });
      expect(prisma.announcementRead.createMany).not.toHaveBeenCalled();
    });
  });
});
