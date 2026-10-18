import { UserProfile } from '@prisma/client';

export const buildUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'mock-profile-cuid',
  userId: 'mock-user-cuid',
  name: 'John Doe',
  bio: 'A passionate developer.',
  location: 'Earth',
  company: 'Open Source',
  website: 'https://example.com',
  reposCount: 10,
  starsCount: 100,
  followersCount: 50,
  followingCount: 10,
  gistsCount: 5,
  githubJoinedAt: new Date('2020-01-01T00:00:00.000Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
