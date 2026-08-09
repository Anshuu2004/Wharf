import { Context } from 'hono';
import { getPrisma } from '../db';
import { decrypt } from '../utils/encryption';
import { APIKeyService, GithubService, ProfileService } from '../services';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any; contextStore: any } }>;

export const getUserRepos = async (c: AppContext) => {
  const userContext = c.get('user');
  const userId = userContext?.userId;

  if (!userId) {
    return c.json({ success: false, error: 'Authentication Required' }, 401);
  }

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    let encryptedToken = userContext?.githubAccessToken;

    if (!encryptedToken) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { githubAccessToken: true } as any,
        });
        encryptedToken = user?.githubAccessToken;
      } catch (dbErr: any) {
        console.warn('[DB Error] Failed To Read User From DB:', dbErr.message);
      }
    }

    if (!encryptedToken) {
      return c.json({ success: false, error: 'GitHub Account Not Linked Or Database Unreachable' }, 400);
    }

    const token = decrypt(encryptedToken, c.env.ENCRYPTION_SECRET);
    const githubService = new GithubService({ token });

    const page = parseInt(c.req.query('page') || '1');
    const perPage = parseInt(c.req.query('per_page') || '50');

    const repos = await githubService.fetchUserRepos(page, perPage);

    return c.json({
      success: true,
      data: repos,
    });
  } catch (error: any) {
    console.error('Error Fetching User Repos:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed To Fetch GitHub Repositories',
    }, 500);
  }
};

export const addApiKey = async (c: AppContext) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { key, provider, label } = body;
    const userId = c.get('user')?.userId;

    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const apiKeyService = new APIKeyService(c.env.DATABASE_URL);
    const newKey = await apiKeyService.addKey(userId, { key, provider, label });

    return c.json({
      success: true,
      data: {
        id: newKey.id,
        provider: newKey.provider,
        label: newKey.label,
        lastFour: newKey.lastFour,
        isVerified: newKey.isVerified,
        status: newKey.isVerified ? 'valid' : 'pending',
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
};

export const getApiKeys = async (c: AppContext) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const prisma = getPrisma(c.env.DATABASE_URL);
    const rawKeys = await prisma.userApiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        provider: true,
        label: true,
        lastFour: true,
        isVerified: true,
        isActive: true,
        isExhausted: true,
        usageCount: true,
        lastUsed: true,
      },
    });

    const data = rawKeys.map((k) => ({
      id: k.id,
      provider: k.provider.toLowerCase(),
      label: k.label,
      hasKey: true,
      keyPrefix: k.lastFour ? `••••${k.lastFour}` : null,
      isVerified: k.isVerified,
      isActive: k.isActive,
      isExhausted: k.isExhausted,
      usageCount: k.usageCount,
      lastUsed: k.lastUsed,
    }));

    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const revalidateApiKey = async (c: AppContext) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { keyId } = body;
    const userId = c.get('user')?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const prisma = getPrisma(c.env.DATABASE_URL);
    const key = await prisma.userApiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) {
      return c.json({ success: false, error: 'Key not found' }, 404);
    }

    const apiKeyService = new APIKeyService(c.env.DATABASE_URL);
    const isValid = await apiKeyService.revalidateKey(keyId);

    return c.json({ success: true, data: { isValid } });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const deleteApiKey = async (c: AppContext) => {
  try {
    const keyId = c.req.param('keyId');
    const userId = c.get('user')?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const prisma = getPrisma(c.env.DATABASE_URL);
    await prisma.userApiKey.deleteMany({
      where: { id: keyId, userId },
    });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const getProfile = async (c: AppContext) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const prisma = getPrisma(c.env.DATABASE_URL);
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);

    const forceSync = c.req.query('sync') === 'true';
    const profileMissing = !user.profile || user.profile.reposCount === 0;

    const syncGitHubProfile = async () => {
      try {
        const token = user!.githubAccessToken ? decrypt(user!.githubAccessToken, c.env.ENCRYPTION_SECRET) : undefined;
        const profileService = new ProfileService({ token });
        const ghProfile = await profileService.getProfileData(user!.username);

        const newProfile = await prisma.userProfile.upsert({
          where: { userId },
          update: {
            reposCount: ghProfile.repos || 0,
            followersCount: ghProfile.followers || 0,
            followingCount: ghProfile.following || 0,
            githubJoinedAt: ghProfile.joinDate !== 'Unknown' ? new Date(ghProfile.joinDate) : null,
            starsCount: ghProfile.totalStars || 0,
          },
          create: {
            userId,
            reposCount: ghProfile.repos || 0,
            followersCount: ghProfile.followers || 0,
            followingCount: ghProfile.following || 0,
            githubJoinedAt: ghProfile.joinDate !== 'Unknown' ? new Date(ghProfile.joinDate) : null,
            starsCount: ghProfile.totalStars || 0,
          },
        });
        return newProfile;
      } catch (err) {
        console.warn('Could not fetch new GitHub stats', err);
        return null;
      }
    };

    if (profileMissing || forceSync) {
      // Must Wait Synchronously If Missing Or Manually Forced
      const newProfile = await syncGitHubProfile();
      if (newProfile) {
        user = { ...user, profile: newProfile };
      }
    } else {
      // Run It In The Background If It Exists, So Response Is Fast
      try {
        c.executionCtx.waitUntil(syncGitHubProfile());
      } catch {
        // Fallback For Node, Don't Execute In Vitest To Avoid Floating Promises Keeping Runner Alive
        if (process.env.NODE_ENV !== 'test') {
          syncGitHubProfile().catch(console.error);
        }
      }
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      name: user.profile?.name,
      bio: user.profile?.bio,
      location: user.profile?.location,
      company: user.profile?.company,
      website: user.profile?.website,
      reposCount: user.profile?.reposCount || 0,
      followersCount: user.profile?.followersCount || 0,
      followingCount: user.profile?.followingCount || 0,
      gistsCount: user.profile?.gistsCount || 0,
      githubJoinedAt: user.profile?.githubJoinedAt || null,
      starsCount: user.profile?.starsCount || 0,
    };

    return c.json({ success: true, data: payload });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const updateProfile = async (c: AppContext) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({}));
    const { name, bio, location, company, website } = body;
    const prisma = getPrisma(c.env.DATABASE_URL);

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { name, bio, location, company, website },
      create: { userId, name, bio, location, company, website },
    });

    return c.json({ success: true, data: profile });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const getUsageStats = async (c: AppContext) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const prisma = getPrisma(c.env.DATABASE_URL);
    // Batch 1: Less Heavy Aggregate Tables
    const [chats, healthChecks, analytics] = await Promise.all([
      prisma.chatSession.count({ where: { userId } }),
      prisma.healthScore.count({ where: { userId } }),
      prisma.chatAnalytics.aggregate({
        where: { session: { userId } },
        _sum: { totalTokens: true },
      }),
    ]);

    // Batch 2: Heavy Generation Metrics
    const [readmesData, profilesData, changelogsData] = await Promise.all([
      prisma.generation.aggregate({
        where: { repository: { userId }, type: 'README' },
        _count: true,
        _sum: { wordCount: true },
      }),
      prisma.profileReadme.aggregate({
        where: { userId },
        _count: true,
        _sum: { wordCount: true },
      }),
      prisma.changelog.aggregate({
        where: { userId },
        _count: true,
        _sum: { wordCount: true },
      }),
    ]);
      
    const readmesGenerated = readmesData._count;
    const profilesGenerated = profilesData._count;
    const changelogsGenerated = changelogsData._count;

    const readmeTokens = Math.round((readmesData._sum.wordCount || readmesGenerated * 1150) * 1.7);
    const profileTokens = Math.round(
      (profilesData._sum.wordCount || profilesGenerated * 420) * 1.7
    );
    const changelogTokens = Math.round(
      (changelogsData._sum.wordCount || changelogsGenerated * 620) * 1.7
    );
    const healthTokens = healthChecks * 213;

    const chatTokens = analytics._sum.totalTokens || 0;
    const dynamicTotalTokens = chatTokens + readmeTokens + profileTokens + changelogTokens + healthTokens;

    const lifetimeRows = await prisma.$queryRaw<
      Array<{
        lifetimeTokens: bigint;
        lifetimeReadmes: bigint;
        lifetimeProfiles: bigint;
        lifetimeHealthChecks: bigint;
        lifetimeChangelogs: bigint;
        lifetimeChats: bigint;
      }>
    >`
      SELECT "lifetimeTokens", "lifetimeReadmes", "lifetimeProfiles",
             "lifetimeHealthChecks", "lifetimeChangelogs", "lifetimeChats"
      FROM "User" WHERE id = ${userId}
    `;
    const lt = lifetimeRows[0] || {} as any;

    let totalTokens = Number(lt.lifetimeTokens) || 0;
    let finalReadmes = Number(lt.lifetimeReadmes) || 0;
    let finalProfiles = Number(lt.lifetimeProfiles) || 0;
    let finalHealthChecks = Number(lt.lifetimeHealthChecks) || 0;
    let finalChangelogs = Number(lt.lifetimeChangelogs) || 0;
    let finalChats = Number(lt.lifetimeChats) || 0;

    const updates: string[] = [];
    if (dynamicTotalTokens > totalTokens) {
      totalTokens = dynamicTotalTokens;
      updates.push(`"lifetimeTokens" = ${totalTokens}`);
    }
    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET ${updates.join(', ')} WHERE id = '${userId.replace(/'/g, "''")}'`
      );
    }

    const sinceDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    // Gather Heat Maps By Pulling All Activity Timestamps Over The Last Year
    // Batch 1: Primary Generative Items Over Time
    const [generations, profilesRes, changelogsRes] = await Promise.all([
      prisma.generation.findMany({
        where: { repository: { userId }, createdAt: { gte: sinceDate } },
        select: { createdAt: true },
      }),
      prisma.profileReadme.findMany({
        where: { userId, generatedAt: { gte: sinceDate } },
        select: { generatedAt: true },
      }),
      prisma.changelog.findMany({
        where: { userId, generatedAt: { gte: sinceDate } },
        select: { generatedAt: true },
      }),
    ]);
    
    // Batch 2: Chat & Health Sessions Over Time
    const [chatsRes, healthsRes] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId, createdAt: { gte: sinceDate } },
        select: { createdAt: true },
      }),
      prisma.healthScore.findMany({
        where: { userId, checkedAt: { gte: sinceDate } },
        select: { checkedAt: true },
      }),
    ]);

    const dateCounts: Record<string, number> = {};
    const incrementDate = (date?: Date | null) => {
      if (!date) return;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    };

    generations.forEach(g => incrementDate(g.createdAt));
    profilesRes.forEach(p => incrementDate(p.generatedAt));
    changelogsRes.forEach(c => incrementDate(c.generatedAt));
    chatsRes.forEach(c => incrementDate(c.createdAt));
    healthsRes.forEach(h => incrementDate(h.checkedAt));
    
    // Sync Missing Records (e.g. deleted history) To Current Day To Force Heatmap To Align With Lifetime Stats
    let heatmapTotal = 0;
    Object.values(dateCounts).forEach(count => heatmapTotal += count);
    const expectedTotal = finalReadmes + finalChats + finalProfiles + finalHealthChecks + finalChangelogs;
    
    if (heatmapTotal < expectedTotal) {
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      dateCounts[todayKey] = (dateCounts[todayKey] || 0) + (expectedTotal - heatmapTotal);
    } else if (heatmapTotal > expectedTotal) {
      // Edge Case: If Actual Records Exceed Lifetime Records We Must Accept Reality
      // (Although Lifetime Aggregates Are Structurally Authoritative)
    }

    const heatmapData = Object.entries(dateCounts).map(([date, count]) => ({ date, count }));

    const data = {
      totalRequests: finalReadmes + finalChats + finalProfiles + finalHealthChecks + finalChangelogs,
      totalTokens,
      readmesGenerated: finalReadmes,
      chats: finalChats,
      profilesGenerated: finalProfiles,
      healthChecks: finalHealthChecks,
      changelogsGenerated: finalChangelogs,
      lastActive: new Date().toISOString(),
      heatmapData,
    };

    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const getPreferences = async (c: AppContext) => { return c.json({ success: true })};
export const updatePreferences = async (c: AppContext) => { return c.json({ success: true })};
export const clearUserData = async (c: AppContext) => { return c.json({ success: true })};

export const exportUserData = async (c: AppContext) => {
  // Zip Streaming Is Restricted On Cloudflare, Return Basic JSON
  return c.json({ success: true, message: 'Export Currently Disabled On Edge, Use Node.js Backend' });
};
