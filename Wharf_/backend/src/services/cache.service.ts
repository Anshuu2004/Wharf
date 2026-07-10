import { cacheGet, cacheSet } from '../utils/redis';

const ANALYSIS_TTL = 2 * 60 * 60; // 2 Hours
const README_TTL = 24 * 60 * 60; // 24 Hours
const CHANGELOG_TTL = 1 * 60 * 60; // 1 Hour

export class CacheService {
  /* Get Cached Repository Analysis */
  async getAnalysis(owner: string, repo: string): Promise<any | null> {
    const key = `repo:analysis:${owner.toLowerCase()}:${repo.toLowerCase()}`;
    const cached = await cacheGet(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  /* Set Cached Repository Analysis */
  async setAnalysis(owner: string, repo: string, data: any): Promise<void> {
    const key = `repo:analysis:${owner.toLowerCase()}:${repo.toLowerCase()}`;
    await cacheSet(key, JSON.stringify(data), ANALYSIS_TTL);
  }

  /* Get Cached README Markdown */
  async getReadme(
    owner: string,
    repo: string,
    tone: string,
    sections: string[]
  ): Promise<string | null> {
    const sectionsHash = this.hashSections(sections);
    const key = `repo:readme:${owner.toLowerCase()}:${repo.toLowerCase()}:${tone}:${sectionsHash}`;
    return await cacheGet(key);
  }

  /* Set Cached README Markdown */
  async setReadme(
    owner: string,
    repo: string,
    tone: string,
    sections: string[],
    markdown: string
  ): Promise<void> {
    const sectionsHash = this.hashSections(sections);
    const key = `repo:readme:${owner.toLowerCase()}:${repo.toLowerCase()}:${tone}:${sectionsHash}`;
    await cacheSet(key, markdown, README_TTL);
  }

  /* Get Cached Profile Data */
  async getProfileData(username: string): Promise<any | null> {
    const key = `profile:data:${username.toLowerCase()}`;
    const cached = await cacheGet(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  /* Set Cached Profile Data */
  async setProfileData(username: string, data: any): Promise<void> {
    const key = `profile:data:${username.toLowerCase()}`;
    await cacheSet(key, JSON.stringify(data), ANALYSIS_TTL);
  }

  /* Get Cached Profile README */
  async getProfileReadme(
    username: string,
    template: string,
    theme: string
  ): Promise<string | null> {
    const key = `profile:readme:${username.toLowerCase()}:${template}:${theme}`;
    return await cacheGet(key);
  }

  /* Set Cached Profile README */
  async setProfileReadme(
    username: string,
    template: string,
    theme: string,
    markdown: string
  ): Promise<void> {
    const key = `profile:readme:${username.toLowerCase()}:${template}:${theme}`;
    await cacheSet(key, markdown, README_TTL);
  }

  /* Hash Sections To Form A Short Unique Key */
  private hashSections(sections: string[]): string {
    const sorted = [...sections].sort();
    return sorted.join(',');
  }

  /* Get Cached Changelog Stats */
  async getChangelogStats(repoUrl: string): Promise<any | null> {
    const key = `changelog:stats:${repoUrl.toLowerCase()}`;
    const cached = await cacheGet(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  /* Set Cached Changelog Stats */
  async setChangelogStats(repoUrl: string, data: any): Promise<void> {
    const key = `changelog:stats:${repoUrl.toLowerCase()}`;
    await cacheSet(key, JSON.stringify(data), CHANGELOG_TTL);
  }

  /* Get Cached Changelog Content */
  async getChangelog(repoUrl: string, options: any): Promise<string | null> {
    const key = `changelog:content:${repoUrl.toLowerCase()}:${JSON.stringify(options)}`;
    return await cacheGet(key);
  }

  /* Set Cached Changelog Content */
  async setChangelog(repoUrl: string, options: any, content: string): Promise<void> {
    const key = `changelog:content:${repoUrl.toLowerCase()}:${JSON.stringify(options)}`;
    await cacheSet(key, content, CHANGELOG_TTL);
  }
}

export const cacheService = new CacheService();
