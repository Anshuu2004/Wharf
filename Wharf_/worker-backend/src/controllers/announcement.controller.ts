import { Context } from 'hono';
import { AnnouncementService } from '../services/announcement.service';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any; contextStore: any } }>;

const svc = (c: AppContext) => new AnnouncementService(c.env.DATABASE_URL);

export const AdminAnnouncementController = {
  async getAll(c: AppContext) {
    try {
      const announcements = await svc(c).getAllAdminAnnouncements();
      return c.json(announcements);
    } catch (error) {
      console.error('[AdminAnnouncementController.getAll] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async create(c: AppContext) {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { title, message, type, expiresAt, isPublished, isPinned } = body;
      const announcement = await svc(c).createAnnouncement({
        title,
        message,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isPublished,
        isPinned,
      });
      return c.json(announcement, 201);
    } catch (error) {
      console.error('[AdminAnnouncementController.create] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async update(c: AppContext) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json().catch(() => ({}));
      const { title, message, type, expiresAt, isPinned } = body;
      const data: any = { title, message, type, isPinned };
      if (expiresAt !== undefined) {
        data.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }
      const announcement = await svc(c).updateAnnouncement(String(id), data);
      return c.json(announcement);
    } catch (error) {
      console.error('[AdminAnnouncementController.update] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async togglePublish(c: AppContext) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json().catch(() => ({}));
      const { isPublished } = body;
      const announcement = await svc(c).togglePublish(String(id), isPublished);
      return c.json(announcement);
    } catch (error) {
      console.error('[AdminAnnouncementController.togglePublish] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async delete(c: AppContext) {
    try {
      const id = c.req.param('id');
      await svc(c).deleteAnnouncement(String(id));
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('[AdminAnnouncementController.delete] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },
};

export const UserNotificationController = {
  async getList(c: AppContext) {
    try {
      const user = c.get('user');
      const userId = user?.userId || user?.id;
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '50');

      const notifications = await svc(c).getUserNotifications(userId, page, limit);
      return c.json(notifications);
    } catch (error) {
      console.error('[UserNotificationController.getList] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async getUnreadCount(c: AppContext) {
    try {
      const user = c.get('user');
      const userId = user?.userId || user?.id;
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const count = await svc(c).getUnreadCount(userId);
      return c.json({ count });
    } catch (error) {
      console.error('[UserNotificationController.getUnreadCount] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async markAsRead(c: AppContext) {
    try {
      const user = c.get('user');
      const userId = user?.userId || user?.id;
      const announcementId = c.req.param('id');
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      await svc(c).markAsRead(String(userId), announcementId!);
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('[UserNotificationController.markAsRead] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async markAllAsRead(c: AppContext) {
    try {
      const user = c.get('user');
      const userId = user?.userId || user?.id;
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const result = await svc(c).markAllAsRead(userId);
      return c.json(result);
    } catch (error) {
      console.error('[UserNotificationController.markAllAsRead] Error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },
};
