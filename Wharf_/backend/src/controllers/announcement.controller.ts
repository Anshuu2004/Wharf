import { Request, Response } from 'express';
import { announcementService } from '../services/announcement.service';

export const AdminAnnouncementController = {
  async getAll(req: Request, res: Response) {
    try {
      const announcements = await announcementService.getAllAdminAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error('[AdminAnnouncementController.getAll] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, message, type, expiresAt, isPublished, isPinned } = req.body;
      const announcement = await announcementService.createAnnouncement({
        title,
        message,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isPublished,
        isPinned,
      });
      res.status(201).json(announcement);
    } catch (error) {
      console.error('[AdminAnnouncementController.create] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, message, type, expiresAt, isPinned } = req.body;
      const data: any = { title, message, type, isPinned };
      if (expiresAt !== undefined) {
        data.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }
      const announcement = await announcementService.updateAnnouncement(id, data);
      res.json(announcement);
    } catch (error) {
      console.error('[AdminAnnouncementController.update] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async togglePublish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;
      const announcement = await announcementService.togglePublish(id, isPublished);
      res.json(announcement);
    } catch (error) {
      console.error('[AdminAnnouncementController.togglePublish] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await announcementService.deleteAnnouncement(id);
      res.status(204).send();
    } catch (error) {
      console.error('[AdminAnnouncementController.delete] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export const UserNotificationController = {
  async getList(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const notifications = await announcementService.getUserNotifications(userId, page, limit);
      res.json(notifications);
    } catch (error) {
      console.error('[UserNotificationController.getList] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const count = await announcementService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('[UserNotificationController.getUnreadCount] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const { id: announcementId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await announcementService.markAsRead(userId, announcementId);
      res.status(204).send();
    } catch (error) {
      console.error('[UserNotificationController.markAsRead] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await announcementService.markAllAsRead(userId);
      res.json(result);
    } catch (error) {
      console.error('[UserNotificationController.markAllAsRead] Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
