import { Request, Response } from 'express';
import prisma from '../db';
import { decrypt } from '../utils/encryption';
import { APIKeyService, GithubService, ProfileService } from '../services';

export const getUserRepos = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication Required' });
  }

  try {
    let encryptedToken = (req as any).user?.githubAccessToken;

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
      return res
        .status(400)
        .json({ success: false, error: 'GitHub Account Not Linked Or Database Unreachable' });
    }

    const token = decrypt(encryptedToken);
    const githubService = new GithubService({ token });

    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 50;

    const repos = await githubService.fetchUserRepos(page, perPage);

    res.json({
      success: true,
      data: repos,
    });
  } catch (error: any) {
    console.error('Error Fetching User Repos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed To Fetch GitHub Repositories',
    });
  }
};

// Add New API Key
export const addApiKey = async (req: Request, res: Response) => {
  try {
    const { key, provider, label } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const apiKeyService = new APIKeyService();
    const newKey = await apiKeyService.addKey(userId, { key, provider, label });

    return res.json({
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
    return res.status(400).json({ success: false, error: error.message });
  }
};

// List All Keys — Returns Shape The ApiKeysTab Frontend Expects
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

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

    // Shape For Frontend: One Entry Per Provider Found
    const data = rawKeys.map((k) => ({
      id: k.id,
      provider: k.provider.toLowerCase(), // Frontend Uses Lowercase Provider IDs
      label: k.label,
      hasKey: true,
      keyPrefix: k.lastFour ? `••••${k.lastFour}` : null,
      isVerified: k.isVerified,
      isActive: k.isActive,
      isExhausted: k.isExhausted,
      usageCount: k.usageCount,
      lastUsed: k.lastUsed,
    }));

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Revalidate A Key
export const revalidateApiKey = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.body;
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const key = await prisma.userApiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }

    const apiKeyService = new APIKeyService();
    const isValid = await apiKeyService.revalidateKey(keyId);

    return res.json({ success: true, data: { isValid } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Key
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    await prisma.userApiKey.deleteMany({
      where: { id: keyId, userId },
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Fetch Latest GitHub Stats Seamlessly
    try {
      const token = user.githubAccessToken ? decrypt(user.githubAccessToken) : undefined;
      const profileService = new ProfileService({ token });
      const ghProfile = await profileService.getProfileData(user.username);

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
      user = { ...user, profile: newProfile };
    } catch (err) {
      console.warn('Could not fetch new GitHub stats', err);
    }

    // Combine Base User & Profile For Frontend
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

    return res.json({ success: true, data: payload });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { name, bio, location, company, website } = req.body;

    // Upsert UserProfile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { name, bio, location, company, website },
      create: { userId, name, bio, location, company, website },
    });

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const [chats, healthChecks, analytics, readmesData, profilesData, changelogsData] =
      await Promise.all([
        prisma.chatSession.count({ where: { userId } }),
        prisma.healthScore.count({ where: { userId } }),
        prisma.chatAnalytics.aggregate({
          where: { session: { userId } },
          _sum: { totalTokens: true },
        }),
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

    // 1.37 Tokens/Word
    const readmeTokens = Math.round((readmesData._sum.wordCount || readmesGenerated * 1150) * 1.37);
    const profileTokens = Math.round(
      (profilesData._sum.wordCount || profilesGenerated * 420) * 1.37
    );
    const changelogTokens = Math.round(
      (changelogsData._sum.wordCount || changelogsGenerated * 620) * 1.37
    );
    const healthTokens = healthChecks * 213;

    const chatTokens = analytics._sum.totalTokens || 0;
    const dynamicTotalTokens =
      chatTokens + readmeTokens + profileTokens + changelogTokens + healthTokens;

    // Raw SQL Read — Bypasses Stale Prisma Client Types
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
    const lt = lifetimeRows[0] || {};

    let totalTokens = Number(lt.lifetimeTokens) || 0;
    let finalReadmes = Number(lt.lifetimeReadmes) || 0;
    let finalProfiles = Number(lt.lifetimeProfiles) || 0;
    let finalHealthChecks = Number(lt.lifetimeHealthChecks) || 0;
    let finalChangelogs = Number(lt.lifetimeChangelogs) || 0;
    let finalChats = Number(lt.lifetimeChats) || 0;

    // High-Water Mark Sync: If Dynamic Is Higher, Persist It Via Raw SQL
    const updates: string[] = [];
    if (dynamicTotalTokens > totalTokens) {
      totalTokens = dynamicTotalTokens;
      updates.push(`"lifetimeTokens" = ${totalTokens}`);
    }
    if (readmesGenerated > finalReadmes) {
      finalReadmes = readmesGenerated;
      updates.push(`"lifetimeReadmes" = ${finalReadmes}`);
    }
    if (profilesGenerated > finalProfiles) {
      finalProfiles = profilesGenerated;
      updates.push(`"lifetimeProfiles" = ${finalProfiles}`);
    }
    if (healthChecks > finalHealthChecks) {
      finalHealthChecks = healthChecks;
      updates.push(`"lifetimeHealthChecks" = ${finalHealthChecks}`);
    }
    if (changelogsGenerated > finalChangelogs) {
      finalChangelogs = changelogsGenerated;
      updates.push(`"lifetimeChangelogs" = ${finalChangelogs}`);
    }
    if (chats > finalChats) {
      finalChats = chats;
      updates.push(`"lifetimeChats" = ${finalChats}`);
    }

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET ${updates.join(', ')} WHERE id = '${userId.replace(/'/g, "''")}'`
      );
    }

    const sinceDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const [gens, profiles, healths, changelogList, chatSessions] = await Promise.all([
      prisma.generation.findMany({
        where: { repository: { userId }, createdAt: { gte: sinceDate } },
        select: { createdAt: true },
      }),
      prisma.profileReadme.findMany({
        where: { userId, generatedAt: { gte: sinceDate } },
        select: { generatedAt: true },
      }),
      prisma.healthScore.findMany({
        where: { userId, checkedAt: { gte: sinceDate } },
        select: { checkedAt: true },
      }),
      prisma.changelog.findMany({
        where: { userId, generatedAt: { gte: sinceDate } },
        select: { generatedAt: true },
      }),
      prisma.chatSession.findMany({
        where: { userId, createdAt: { gte: sinceDate } },
        select: { createdAt: true },
      }),
    ]);
    const dateMap: Record<string, number> = {};
    const addDate = (d: Date) => {
      const k = d.toISOString().split('T')[0];
      dateMap[k] = (dateMap[k] || 0) + 1;
    };
    gens.forEach((g) => addDate(g.createdAt));
    profiles.forEach((p) => addDate(p.generatedAt));
    healths.forEach((h) => addDate(h.checkedAt));
    changelogList.forEach((c) => addDate(c.generatedAt));
    chatSessions.forEach((c) => addDate(c.createdAt));
    const heatmapData = Object.entries(dateMap).map(([date, count]) => ({ date, count }));

    const totalRequests = finalReadmes + finalChats + finalProfiles + finalHealthChecks + finalChangelogs;
    const heatmapSum = heatmapData.reduce((s, d) => s + d.count, 0);
    const orphaned = totalRequests - heatmapSum;

    if (orphaned > 0) {
      const todayKey = new Date().toISOString().split('T')[0];
      const todayEntry = heatmapData.find(d => d.date === todayKey);
      if (todayEntry) {
        todayEntry.count += orphaned;
      } else {
        heatmapData.push({ date: todayKey, count: orphaned });
      }
    }

    const data = {
      totalRequests,
      totalTokens,
      readmesGenerated: finalReadmes,
      chats: finalChats,
      profilesGenerated: finalProfiles,
      healthChecks: finalHealthChecks,
      changelogsGenerated: finalChangelogs,
      lastActive: new Date().toISOString(),
      heatmapData,
    };

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    // Default Preferences If Null
    const prefs = user?.preferences || {
      emailNotifications: false,
      autoSave: true,
      betaFeatures: false,
    };

    return res.json({ success: true, data: prefs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const prefs = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs },
    });

    return res.json({ success: true, data: prefs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const clearUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    await prisma.$transaction([
      // Reset User Profile Stats
      prisma.userProfile.update({
        where: { userId },
        data: {
          reposCount: 0,
          starsCount: 0,
          followersCount: 0,
          followingCount: 0,
          gistsCount: 0,
        },
      }),
      // Clear Associated Data While Preserving The Records
      prisma.profileReadme.updateMany({ 
        where: { userId }, 
        data: { userId: null } 
      }),
      prisma.healthScore.updateMany({ 
        where: { userId }, 
        data: { userId: null } 
      }),
      prisma.changelog.updateMany({ 
        where: { userId }, 
        data: { userId: null } 
      }),
      // Delete User-Specific Data
      prisma.chatSession.deleteMany({ where: { userId } }),
      prisma.repository.deleteMany({ where: { userId } })
    ]);

    return res.json({ success: true, message: 'Data Cleared Successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const exportUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const format = req.query.format === 'zip' ? 'zip' : 'json';

    const [user, apiKeys, profileReadmes, healthScores, changelogs, chatSessions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      prisma.userApiKey.findMany({ where: { userId } }),
      prisma.profileReadme.findMany({ where: { userId } }),
      prisma.healthScore.findMany({ where: { userId } }),
      prisma.changelog.findMany({ where: { userId } }),
      prisma.chatSession.findMany({
        where: { userId },
        include: { messages: true },
      })
    ]);

    const exportData = {
      user: { ...user, githubAccessToken: 'REDACTED', installationId: 'REDACTED' },
      apiKeys: apiKeys.map((k) => ({ ...k, key: 'REDACTED' })),
      profileReadmes,
      healthScores,
      changelogs,
      chatSessions,
    };

    if (format === 'json') {
      return res.json({ success: true, data: exportData });
    } else {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="wharf-data-${Date.now()}.zip"`);

      // Use adm-zip
      const AdmZip = require('adm-zip');
      const zip = new AdmZip();

      zip.addFile(
        'profile/profile.json',
        Buffer.from(JSON.stringify(exportData.user, null, 2), 'utf8')
      );
      zip.addFile(
        'profile/api_keys.json',
        Buffer.from(JSON.stringify(exportData.apiKeys, null, 2), 'utf8')
      );

      profileReadmes.forEach((r) => {
        zip.addFile(`repo_readme/${r.username || r.id}.md`, Buffer.from(r.content || '', 'utf8'));
      });

      changelogs.forEach((c) => {
        const repoName = c.repoName ? c.repoName.replace(/[^a-z0-9]/gi, '_') : c.id;
        zip.addFile(`changelogs/${repoName}.md`, Buffer.from(c.content || '', 'utf8'));
      });

      healthScores.forEach((h) => {
        const repoName = h.repoName ? h.repoName.replace(/[^a-z0-9]/gi, '_') : h.id;
        zip.addFile(
          `health/${repoName}.json`,
          Buffer.from(JSON.stringify(h.breakdown || {}, null, 2), 'utf8')
        );
      });

      chatSessions.forEach((c) => {
        const chatContent = c.messages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n\n---\n\n');
        const title = c.title ? c.title.replace(/[^a-z0-9]/gi, '_') : c.id;
        zip.addFile(`chats/${title}.txt`, Buffer.from(chatContent, 'utf8'));
      });

      const zipBuffer = zip.toBuffer();
      return res.send(zipBuffer);
    }
  } catch (error: any) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};
