import { Repository } from '@prisma/client';

export const buildRepository = (overrides: Partial<Repository> = {}): Repository => ({
  id: 'mock-repo-cuid',
  owner: 'FrostByte-49',
  name: 'Wharf',
  description: 'AI-Powered Developer Tools',
  stars: 42,
  language: 'TypeScript',
  url: 'https://github.com/FrostByte-49/Wharf',
  userId: 'mock-user-cuid',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
