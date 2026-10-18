import { User } from '@prisma/client';

export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'mock-user-cuid',
  githubId: 'mock-github-id',
  username: 'testuser',
  avatar: 'https://github.com/avatar.png',
  email: 'testuser@example.com',
  githubAccessToken: 'valid_encrypted_token',
  githubCreatedAt: new Date('2020-01-01T00:00:00.000Z'),
  installationId: null,
  preferences: null,
  lifetimeTokens: 0,
  lifetimeReadmes: 0,
  lifetimeProfiles: 0,
  lifetimeHealthChecks: 0,
  lifetimeChangelogs: 0,
  lifetimeChats: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
