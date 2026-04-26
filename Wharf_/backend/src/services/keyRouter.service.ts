import prisma from '../db';
import { decrypt } from '../utils/encryption';

export interface KeyInfo {
  id: string;
  key: string;
  provider: string;
  isSystem: boolean;
}

export class KeyRouterService {
  // Retrieves The Best Available Key For A Given Provider.
  // Priority: User's BYOK (Rotated) > System Key Pool (Rotated)
  
  async getAvailableKey(provider: string, userId?: string): Promise<KeyInfo | null> {
    // 1. Try User's BYOK first (Rotating Through Their Keys)
    if (userId) {
      const userKey = await (prisma as any).userApiKey.findFirst({
        where: {
          userId,
          provider: provider.toUpperCase(),
          isExhausted: false,
        },
        orderBy: {
          lastUsed: 'asc', // Round-Robin Rotation For User Keys Too!
        },
      });

      if (userKey) {
        // Update User Key Usage
        await (prisma as any).userApiKey.update({
          where: { id: userKey.id },
          data: { 
            lastUsed: new Date(),
            usageCount: { increment: 1 }
          },
        });

        return {
          id: userKey.id,
          key: decrypt(userKey.key),
          provider: userKey.provider,
          isSystem: false,
        };
      }
    }

    // 2. Try System Key Pool
    const systemKey = await (prisma as any).systemKey.findFirst({
      where: {
        provider: provider.toUpperCase(),
        isExhausted: false,
      },
      orderBy: {
        lastUsed: 'asc', // Round-Robin Rotation
      },
    });

    if (systemKey) {
      // Update lastUsed Timestamp
      await (prisma as any).systemKey.update({
        where: { id: systemKey.id },
        data: { 
          lastUsed: new Date(),
          usageCount: { increment: 1 }
        },
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

  // Marks A Key As Exhausted (Works For Both User And System Keys).
  async markAsExhausted(keyId: string, isSystem: boolean): Promise<void> {
    if (isSystem) {
      await (prisma as any).systemKey.update({
        where: { id: keyId },
        data: { isExhausted: true },
      });
    } else {
      await (prisma as any).userApiKey.update({
        where: { id: keyId },
        data: { isExhausted: true },
      });
    }
  }

  // Resets All Exhausted Keys In Both Pools.
  async resetAllExhaustedKeys(): Promise<void> {
    await (prisma as any).systemKey.updateMany({
      where: { isExhausted: true },
      data: { isExhausted: false },
    });

    await (prisma as any).userApiKey.updateMany({
      where: { isExhausted: true },
      data: { isExhausted: false },
    });
  }
}
