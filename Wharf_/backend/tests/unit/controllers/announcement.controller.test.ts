import { Request, Response } from 'express';
import { AdminAnnouncementController, UserNotificationController } from '../../../src/controllers/announcement.controller';
import { announcementService } from '../../../src/services/announcement.service';

jest.mock('../../../src/services/announcement.service');

describe('Announcement Controllers', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: mockSend });
    mockReq = {
      body: {}, query: {}, params: {}, user: { userId: 'u-1' }
    };
    mockRes = { status: mockStatus, json: mockJson, send: mockSend };
  });

  describe('AdminAnnouncementController', () => {
    it('getAll should return all announcements', async () => {
      (announcementService.getAllAdminAnnouncements as jest.Mock).mockResolvedValue([{ id: 1 }]);
      await AdminAnnouncementController.getAll(mockReq, mockRes as Response);
      expect(mockJson).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('create should invoke service and return 201', async () => {
      mockReq.body = { title: 'Test', type: 'INFO' };
      (announcementService.createAnnouncement as jest.Mock).mockResolvedValue({ id: 2, title: 'Test' });
      await AdminAnnouncementController.create(mockReq, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({ id: 2, title: 'Test' });
    });

    it('update should format dates and hit service', async () => {
      mockReq.params = { id: 'a-1' };
      mockReq.body = { expiresAt: '2026-08-01T00:00:00.000Z' };
      (announcementService.updateAnnouncement as jest.Mock).mockResolvedValue({ id: 'a-1' });
      
      await AdminAnnouncementController.update(mockReq, mockRes as Response);
      
      expect(announcementService.updateAnnouncement).toHaveBeenCalledWith('a-1', expect.objectContaining({
        expiresAt: new Date('2026-08-01T00:00:00.000Z')
      }));
    });

    it('togglePublish should return updated status', async () => {
      mockReq.params = { id: 'a-1' };
      mockReq.body = { isPublished: true };
      
      await AdminAnnouncementController.togglePublish(mockReq, mockRes as Response);
      expect(announcementService.togglePublish).toHaveBeenCalledWith('a-1', true);
    });

    it('delete should return 204', async () => {
      mockReq.params = { id: 'a-1' };
      await AdminAnnouncementController.delete(mockReq, mockRes as Response);
      expect(announcementService.deleteAnnouncement).toHaveBeenCalledWith('a-1');
      expect(mockStatus).toHaveBeenCalledWith(204);
    });
  });

  describe('UserNotificationController', () => {
    it('getList should fetch paginated notifications for user', async () => {
      mockReq.query = { page: '2', limit: '10' };
      (announcementService.getUserNotifications as jest.Mock).mockResolvedValue([{ id: 3 }]);
      
      await UserNotificationController.getList(mockReq, mockRes as Response);
      expect(announcementService.getUserNotifications).toHaveBeenCalledWith('u-1', 2, 10);
      expect(mockJson).toHaveBeenCalledWith([{ id: 3 }]);
    });

    it('getUnreadCount should return numeric count', async () => {
      (announcementService.getUnreadCount as jest.Mock).mockResolvedValue(5);
      await UserNotificationController.getUnreadCount(mockReq, mockRes as Response);
      expect(announcementService.getUnreadCount).toHaveBeenCalledWith('u-1');
      expect(mockJson).toHaveBeenCalledWith({ count: 5 });
    });

    it('markAsRead should return 204 no content', async () => {
      mockReq.params = { id: 'n-1' };
      await UserNotificationController.markAsRead(mockReq, mockRes as Response);
      expect(announcementService.markAsRead).toHaveBeenCalledWith('u-1', 'n-1');
      expect(mockStatus).toHaveBeenCalledWith(204);
    });

    it('markAllAsRead should invoke service', async () => {
      await UserNotificationController.markAllAsRead(mockReq, mockRes as Response);
      expect(announcementService.markAllAsRead).toHaveBeenCalledWith('u-1');
    });
  });
});
