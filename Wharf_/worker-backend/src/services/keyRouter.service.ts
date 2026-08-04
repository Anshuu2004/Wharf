import { getPrisma } from '../db';
import { decrypt } from '../utils/encryption';

export interface KeyInfo {
  id: string;
  key: string;
  provider: string;
  isSystem: boolean;
}

export class KeyRouterService {
  private dbUrl: string;

  constructor(dbUrl: string) {
    this.dbUrl = dbUrl;
  }
  /* Check Only User BYOK Keys */
  async getUserKey(provider: string, userId: string): Promise<KeyInfo | null> {
    const normalizedProvider = provider.toUpperCase();
    try {
      const prisma = getPrisma(this.dbUrl);
      const userKey = await prisma.userApiKey.findFirst({
        where: {
          userId,
          provider: normalizedProvider,
          isExhausted: false,
          isVerified: true,
          isActive: true,
        },
        orderBy: { lastUsed: 'asc' },
      });

      if (userKey) {
        console.log(
          `[KeyRouter] BYOK hit — User Key For ${normalizedProvider} (userId=${userId})`
        );
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
    } catch (err: any) {
      console.warn(`[KeyRouter] Error Querying User Keys For ${normalizedProvider}:`, err?.message);
    }
    return null;
  }

  /* Check Only System Key Pool */
  async getSystemKey(provider: string): Promise<KeyInfo | null> {
    const normalizedProvider = provider.toUpperCase();
    const prisma = getPrisma(this.dbUrl);
    const systemKey = await prisma.systemKey.findFirst({
      where: { provider: normalizedProvider, isExhausted: false },
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

  /* Legacy: User Key First, Then System Fallback (Fept For Backward Compat) */
  async getAvailableKey(provider: string, userId?: string): Promise<KeyInfo | null> {
    if (userId) {
      const userKey = await this.getUserKey(provider, userId);
      if (userKey) return userKey;
    }
    return this.getSystemKey(provider);
  }

  async markAsExhausted(keyId: string, isSystem: boolean): Promise<void> {
    const prisma = getPrisma(this.dbUrl);
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
    const prisma = getPrisma(this.dbUrl);
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
