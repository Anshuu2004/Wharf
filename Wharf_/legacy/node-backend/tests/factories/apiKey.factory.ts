import { UserApiKey } from '@prisma/client';

export const buildUserApiKey = (overrides: Partial<UserApiKey> = {}): UserApiKey => ({
  id: 'mock-apikey-cuid',
  provider: 'OPENAI',
  key: 'mock-encrypted-key-value',
  label: 'Primary',
  lastFour: '1234',
  isVerified: true,
  isActive: true,
  isExhausted: false,
  verificationError: null,
  usageCount: 0,
  lastUsed: null,
  lastVerifiedAt: new Date(),
  expiresAt: null,
  userId: 'mock-user-cuid',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
