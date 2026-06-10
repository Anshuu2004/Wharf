import { cacheGet, cacheSet } from '../utils/redis';

const ANALYSIS_TTL = 2 * 60 * 60; // 2 Hours 
const README_TTL = 24 * 60 * 60; // 24 Hours 

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
  async getReadme(owner: string, repo: string, tone: string, sections: string[]): Promise<string | null> {
    const sectionsHash = this.hashSections(sections);
    const key = `repo:readme:${owner.toLowerCase()}:${repo.toLowerCase()}:${tone}:${sectionsHash}`;
    return await cacheGet(key);
  }

  /* Set Cached README Markdown */
  async setReadme(owner: string, repo: string, tone: string, sections: string[], markdown: string): Promise<void> {
    const sectionsHash = this.hashSections(sections);
    const key = `repo:readme:${owner.toLowerCase()}:${repo.toLowerCase()}:${tone}:${sectionsHash}`;
    await cacheSet(key, markdown, README_TTL);
  }

  /* Hash Sections To Form A Short Unique Key */
  private hashSections(sections: string[]): string {
    const sorted = [...sections].sort();
    return sorted.join(',');
  }
}

export const cacheService = new CacheService();
