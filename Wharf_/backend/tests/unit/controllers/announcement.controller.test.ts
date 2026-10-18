import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { AdminAnnouncementController, UserNotificationController } from '../../../src/controllers/announcement.controller';
import { AnnouncementService } from '../../../src/services/announcement.service';
import { createMockContext } from '../test-utils';

vi.mock('../../../src/services/announcement.service');
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn()
}));

describe('Announcement Controllers', () => {
  let mockEnv: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv = {};
  });

  describe('AdminAnnouncementController', () => {
    it('getAll should return all announcements', async () => {
      const c = createMockContext({}, mockEnv);
      (AnnouncementService.prototype.getAllAdminAnnouncements as Mock).mockResolvedValue([{ id: 1 }]);
      await AdminAnnouncementController.getAll(c);
      expect(c.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('create should invoke service and return 201', async () => {
      const c = createMockContext({ body: { title: 'Test', type: 'INFO' } }, mockEnv);
      (AnnouncementService.prototype.createAnnouncement as Mock).mockResolvedValue({ id: 2, title: 'Test' });
      await AdminAnnouncementController.create(c);
      expect(c.json).toHaveBeenCalledWith({ id: 2, title: 'Test' }, 201);
    });

    it('update should format dates and hit service', async () => {
      const c = createMockContext({ 
        params: { id: 'a-1' }, 
        body: { expiresAt: '2026-08-01T00:00:00.000Z' } 
      }, mockEnv);
      
      (AnnouncementService.prototype.updateAnnouncement as Mock).mockResolvedValue({ id: 'a-1' });
      
      await AdminAnnouncementController.update(c);
      
      expect(AnnouncementService.prototype.updateAnnouncement).toHaveBeenCalledWith('a-1', expect.objectContaining({
        expiresAt: new Date('2026-08-01T00:00:00.000Z')
      }));
    });

    it('togglePublish should return updated status', async () => {
      const c = createMockContext({ 
        params: { id: 'a-1' }, 
        body: { isPublished: true } 
      }, mockEnv);
      
      await AdminAnnouncementController.togglePublish(c);
      expect(AnnouncementService.prototype.togglePublish).toHaveBeenCalledWith('a-1', true);
    });

    it('delete should return 204', async () => {
      const c = createMockContext({ params: { id: 'a-1' } }, mockEnv);
      const res = await AdminAnnouncementController.delete(c);
      expect(AnnouncementService.prototype.deleteAnnouncement).toHaveBeenCalledWith('a-1');
      expect(res.status).toBe(204);
    });
  });

  describe('UserNotificationController', () => {
    it('getList should fetch paginated notifications for user', async () => {
      const c = createMockContext({ query: { page: '2', limit: '10' } }, mockEnv, { userId: 'u-1' });
      (AnnouncementService.prototype.getUserNotifications as Mock).mockResolvedValue([{ id: 3 }]);
      
      await UserNotificationController.getList(c);
      expect(AnnouncementService.prototype.getUserNotifications).toHaveBeenCalledWith('u-1', 2, 10);
      expect(c.json).toHaveBeenCalledWith([{ id: 3 }]);
    });

    it('getUnreadCount should return numeric count', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });
      (AnnouncementService.prototype.getUnreadCount as Mock).mockResolvedValue(5);
      
      await UserNotificationController.getUnreadCount(c);
      expect(AnnouncementService.prototype.getUnreadCount).toHaveBeenCalledWith('u-1');
      expect(c.json).toHaveBeenCalledWith({ count: 5 });
    });

    it('markAsRead should return 204 no content', async () => {
      const c = createMockContext({ params: { id: 'n-1' } }, mockEnv, { userId: 'u-1' });
      const res = await UserNotificationController.markAsRead(c);
      expect(AnnouncementService.prototype.markAsRead).toHaveBeenCalledWith('u-1', 'n-1');
      expect(res.status).toBe(204);
    });

    it('markAllAsRead should invoke service', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });
      await UserNotificationController.markAllAsRead(c);
      expect(AnnouncementService.prototype.markAllAsRead).toHaveBeenCalledWith('u-1');
    });
  });
});
