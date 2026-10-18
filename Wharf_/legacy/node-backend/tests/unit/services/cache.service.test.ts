import { cacheService } from '../../../src/services/cache.service';
import { cacheGet, cacheSet } from '../../../src/utils/redis';

jest.mock('../../../src/utils/redis', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
}));

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Analysis Cache', () => {
    it('should return null if cache misses', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(null);
      
      const result = await cacheService.getAnalysis('FrostByte-49', 'Wharf');
      expect(result).toBeNull();
      expect(cacheGet).toHaveBeenCalledWith('repo:analysis:frostbyte-49:wharf');
    });

    it('should return parsed JSON if cache hits', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(JSON.stringify({ score: 100 }));
      
      const result = await cacheService.getAnalysis('FrostByte-49', 'Wharf');
      expect(result).toEqual({ score: 100 });
    });

    it('should catch JSON parse errors and return null', async () => {
      (cacheGet as jest.Mock).mockResolvedValue('invalid-json');
      
      const result = await cacheService.getAnalysis('owner', 'repo');
      expect(result).toBeNull();
    });

    it('should set analysis with correct TTL and key format', async () => {
      await cacheService.setAnalysis('Test-Owner', 'RepoName', { data: 'yes' });
      expect(cacheSet).toHaveBeenCalledWith(
        'repo:analysis:test-owner:reponame',
        JSON.stringify({ data: 'yes' }),
        7200 // 2 Hours
      );
    });
  });

  describe('Readme Cache', () => {
    it('should hash sections effectively for cache keys', async () => {
      await cacheService.getReadme('user', 'repo', 'dev', ['B', 'A']);
      // Notice B, A Should Be Sorted To A,B
      expect(cacheGet).toHaveBeenCalledWith('repo:readme:user:repo:dev:A,B');
    });

    it('should set readme with 24 hours TTL', async () => {
      await cacheService.setReadme('user', 'repo', 'pro', ['Install'], '# Hello');
      expect(cacheSet).toHaveBeenCalledWith('repo:readme:user:repo:pro:Install', '# Hello', 86400);
    });
  });

  describe('Profile Data Cache', () => {
    it('should retrieve correctly', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(JSON.stringify({ bio: 'hi' }));
      const result = await cacheService.getProfileData('User');
      expect(result).toEqual({ bio: 'hi' });
      expect(cacheGet).toHaveBeenCalledWith('profile:data:user');
    });

    it('should set correctly', async () => {
      await cacheService.setProfileData('User', { bio: 'hi' });
      expect(cacheSet).toHaveBeenCalledWith('profile:data:user', JSON.stringify({ bio: 'hi' }), 7200);
    });
  });
});
