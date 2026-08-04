import { getPrisma } from '../db';

/**
 * recordDailyGeneration
 * ---------------------
 * Upserts Today's DailyStats Row And Increments totalGenerations By 1.
 * Also Tracks The Unique User IDs That Generated Today Via A Set Stored In
 * A Module-Level Cache (Resets On Server Restart, Which Is Acceptable —
 * Daily Uniqueness Is Best-Effort For The Trend Chart).
 *
 * Fire-And-Forget: Errors Are Caught And Logged So They Never Block The Response To The User.
 */

// In-Memory Set Of (Date → Set<userId>) Used Only To Estimate ActiveUsers.
// Reset On Each Server Restart — Acceptable For Approximate Trend Data.
const dailyUserSets = new Map<string, Set<string>>();

export async function recordDailyGeneration(dbUrl: string, userId?: string | null): Promise<void> {
  try {
    // Today's Date At Midnight UTC → "YYYY-MM-DD"
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const dayStart = new Date(`${dateKey}T00:00:00.000Z`);

    // Track Unique Users For Today
    if (userId) {
      if (!dailyUserSets.has(dateKey)) {
        dailyUserSets.set(dateKey, new Set<string>());
        // Prune Old Entries (Keep Only Last 2 Days To Avoid Memory Leaks)
        for (const k of dailyUserSets.keys()) {
          if (k < dateKey) dailyUserSets.delete(k);
        }
      }
      dailyUserSets.get(dateKey)!.add(userId);
    }

    const activeUsers = dailyUserSets.get(dateKey)?.size ?? 0;

    // Raw SQL Upsert — DailyStats.date Is @unique, So We Can ON CONFLICT Increment.
    // We Use $executeRaw To Avoid Stale Prisma Client Type Issues.
    const prisma = getPrisma(dbUrl);
    await prisma.$executeRaw`
      INSERT INTO "DailyStats" (id, date, "totalGenerations", "totalUsers", "activeUsers", "successRate", "avgResponseTime", "cacheHitRate", "totalTokens", errors, "newUsers")
      VALUES (gen_random_uuid(), ${dayStart}, 1, 0, ${activeUsers}, 0, 0, 0, 0, 0, 0)
      ON CONFLICT (date) DO UPDATE
        SET "totalGenerations" = "DailyStats"."totalGenerations" + 1,
            "activeUsers"      = GREATEST("DailyStats"."activeUsers", ${activeUsers})
    `;
  } catch (err) {
    // Non-Fatal — Log & Continue
    console.error('[DailyStats] Failed To Record Daily Generation:', err);
  }
}
