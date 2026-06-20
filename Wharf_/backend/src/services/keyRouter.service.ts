import { PrismaClient } from '@prisma/client';
import { decrypt } from '../utils/encryption';

const prisma = new PrismaClient();

export interface KeyInfo {
  id: string;
  key: string;
  provider: string;
  isSystem: boolean;
}

export class KeyRouterService {
  async getAvailableKey(provider: string, userId?: string): Promise<KeyInfo | null> {
    const normalizedProvider = provider.toUpperCase();

    if (userId) {
      const userKey = await prisma.userApiKey.findFirst({
        where: {
          userId,
          provider: normalizedProvider,
          isExhausted: false,
        },
        orderBy: { lastUsed: 'asc' },
      });

      if (userKey) {
        await prisma.userApiKey.update({
          where: { id: userKey.id },
          data: { lastUsed: new Date(), usageCount: { increment: 1 } },
        });

        return {
          id: userKey.id,
          key: decrypt(userKey.key),
          provider: userKey.provider,
          isSystem: false,
        };
      }
    }

    const systemKey = await prisma.systemKey.findFirst({
      where: {
        provider: normalizedProvider,
        isExhausted: false,
      },
      orderBy: { lastUsed: 'asc' },
    });

    if (systemKey) {
      await prisma.systemKey.update({
        where: { id: systemKey.id },
        data: { lastUsed: new Date(), usageCount: { increment: 1 } },
      });

      return {
        id: systemKey.id,
        key: decrypt(systemKey.key),
        provider: systemKey.provider,
        isSystem: true,
      };
    }

    return null;
  }

  async markAsExhausted(keyId: string, isSystem: boolean): Promise<void> {
    if (isSystem) {
      await prisma.systemKey.update({
        where: { id: keyId },
        data: { isExhausted: true },
      });
    } else {
      await prisma.userApiKey.update({
        where: { id: keyId },
        data: { isExhausted: true },
      });
    }
  }

  async resetAllExhaustedKeys(): Promise<void> {
    await prisma.systemKey.updateMany({
      where: { isExhausted: true },
      data: { isExhausted: false },
    });

    await prisma.userApiKey.updateMany({
      where: { isExhausted: true },
      data: { isExhausted: false },
    });
  }
}
