import { GithubService } from './github.service';
import { cacheService } from './cache.service';
import { ProfileData } from '../utils/profilePromptBuilder';

export class ProfileService {
  private githubService: GithubService;

  constructor(options?: { token?: string; installationId?: string }) {
    this.githubService = new GithubService(options);
  }

  async getProfileData(username: string): Promise<ProfileData> {
    // Check Cache
    const cachedData = await cacheService.getProfileData(username);
    if (cachedData) {
      return cachedData as ProfileData;
    }

    try {
      // 1. Fetch User Profile
      const user = await this.githubService.getUserProfile(username);

      // 2. Fetch Top Starred Repositories (Pinned Proxy)
      const topRepos = await this.githubService.getTopStarredRepos(username, 10);

      // Calculate Stats
      let totalStars = 0;
      let totalForks = 0;
      let languageCounts: Record<string, number> = {};
      const techStackSet = new Set<string>();

      const pinnedRepos = topRepos.slice(0, 6).map((repo: any) => ({
        name: repo.name || '',
        description: repo.description || '',
        url: repo.html_url || '',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count || 0,
      }));

      // Summarize Stats & Infer Languages Without Fetching ListLanguages Per Repo To Save API Calls
      // (Using Primary Repo Language)
      if (Array.isArray(topRepos)) {
        topRepos.forEach((repo: any) => {
          totalStars += repo.stargazers_count || 0;
          totalForks += repo.forks_count || 0;

          if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
            techStackSet.add(repo.language.toLowerCase()); // Simple Mapping For Tech Stack

            // Basic Tech Stack Expansion Based On Topics
            if (repo.topics && Array.isArray(repo.topics)) {
              repo.topics.forEach((topic: string) => techStackSet.add(topic.toLowerCase()));
            }
          }
        });
      }

      // Convert Language Counts To TopLanguages Array Sorted By Count
      const totalReposWithLang = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
      const topLanguages = Object.entries(languageCounts)
        .map(([name, count]) => ({
          name,
          percentage: Math.round((count / totalReposWithLang) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      const profileData: ProfileData = {
        username: user.login,
        name: user.name || user.login,
        bio: user.bio || '',
        avatarUrl: user.avatar_url,
        company: user.company || undefined,
        location: user.location || undefined,
        followers: user.followers,
        following: user.following,
        repos: user.public_repos,
        totalStars,
        totalForks,
        topLanguages,
        techStack: Array.from(techStackSet).slice(0, 15),
        contributions: 0,
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown',
        pinnedRepos,
      };

      // Set Cache
      await cacheService.setProfileData(username, profileData);

      return profileData;
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      throw new Error('Failed to fetch profile data from GitHub. Check username or API limits.');
    }
  }
}
