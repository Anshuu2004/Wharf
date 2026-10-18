import { Announcement, AnnouncementRead, AnnouncementType } from '@prisma/client';

export const buildAnnouncement = (overrides: Partial<Announcement> = {}): Announcement => ({
  id: 'mock-announcement-cuid',
  title: 'Platform Update',
  message: 'This is a mock platform update.',
  type: 'FEATURE' as AnnouncementType,
  isPublished: true,
  isPinned: false,
  publishedAt: new Date(),
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const buildAnnouncementRead = (overrides: Partial<AnnouncementRead> = {}): AnnouncementRead => ({
  id: 'mock-read-cuid',
  userId: 'mock-user-cuid',
  announcementId: 'mock-announcement-cuid',
  readAt: new Date(),
  ...overrides,
});
