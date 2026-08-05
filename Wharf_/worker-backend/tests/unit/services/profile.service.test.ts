import type { Mock } from "vitest";
import { ProfileService } from '../../../src/services/profile.service';
import { cacheService } from '../../../src/services/cache.service';
import { GithubService } from '../../../src/services/github.service';

vi.mock('../../../src/services/cache.service', () => ({
  cacheService: {
    getProfileData: vi.fn(),
    setProfileData: vi.fn(),
  },
}));

const { mockGetUserProfile, mockGetTopStarredRepos } = vi.hoisted(() => ({
  mockGetUserProfile: vi.fn(),
  mockGetTopStarredRepos: vi.fn(),
}));

vi.mock('../../../src/services/github.service', () => ({
  GithubService: class {
    getUserProfile = mockGetUserProfile;
    getTopStarredRepos = mockGetTopStarredRepos;
  },
}));

describe('ProfileService', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    vi.clearAllMocks();
    profileService = new ProfileService();
  });

  describe('getProfileData', () => {
    const mockUsername = 'testuser';

    it('should return cached data if available', async () => {
      const cachedData = { username: mockUsername, totalStars: 100 };
      (cacheService.getProfileData as Mock).mockResolvedValue(cachedData);

      const result = await profileService.getProfileData(mockUsername);

      expect(cacheService.getProfileData).toHaveBeenCalledWith(mockUsername);
      expect(result).toEqual(cachedData);
      expect(mockGetUserProfile).not.toHaveBeenCalled();
    });

    it('should fetch from GitHub and compute stats if not cached', async () => {
      (cacheService.getProfileData as Mock).mockResolvedValue(null);

      const mockUserProfile = {
        login: mockUsername,
        name: 'Test User',
        avatar_url: 'http://avatar.url',
        public_repos: 5,
        created_at: '2020-01-01T00:00:00Z',
      };
      
      const mockRepos = [
        { name: 'repo1', stargazers_count: 50, forks_count: 10, language: 'TypeScript' },
        { name: 'repo2', stargazers_count: 30, forks_count: 5, language: 'TypeScript' },
        { name: 'repo3', stargazers_count: 20, language: 'Python' }
      ];

      mockGetUserProfile.mockResolvedValue(mockUserProfile);
      mockGetTopStarredRepos.mockResolvedValue(mockRepos);

      const result = await profileService.getProfileData(mockUsername);

      expect(mockGetUserProfile).toHaveBeenCalledWith(mockUsername);
      expect(mockGetTopStarredRepos).toHaveBeenCalledWith(mockUsername, 10);
      expect(result.username).toBe(mockUsername);
      expect(result.totalStars).toBe(100);
      expect(result.totalForks).toBe(15);
      
      // Top Languages Calculation Verification
      expect(result.topLanguages).toBeDefined();
      expect(result.topLanguages.length).toBe(2);
      expect(result.topLanguages[0].name).toBe('TypeScript');
      
      // Verify Cache Gets Updated
      expect(cacheService.setProfileData).toHaveBeenCalledWith(mockUsername, result);
    });
    
    it('should throw an error if GitHub fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (cacheService.getProfileData as Mock).mockResolvedValue(null);
      mockGetUserProfile.mockRejectedValue(new Error('Rate limit'));
      
      await expect(profileService.getProfileData(mockUsername)).rejects.toThrow('Failed to fetch profile data from GitHub');
      consoleSpy.mockRestore();
    });
  });
});
