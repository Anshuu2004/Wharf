import { RepoService } from '../../../src/services/repo.service';
import { GithubService } from '../../../src/services/github.service';
import { cacheService } from '../../../src/services/cache.service';

jest.mock('../../../src/services/github.service');
jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/utils/parseGithubUrl', () => ({
  parseGithubUrl: jest.fn((url: string) => {
    if (url === 'invalid') return null;
    return { owner: 'owner', repo: 'repo' };
  })
}));
jest.mock('../../../src/utils/logger', () => ({
  loggerService: {
    stepStart: jest.fn(),
    stepEnd: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  }
}));

describe('RepoService', () => {
  let repoService: RepoService;

  beforeEach(() => {
    jest.clearAllMocks();
    repoService = new RepoService();
  });

  describe('analyzeRepo', () => {
    it('should throw an error for invalid github url', async () => {
      await expect(repoService.analyzeRepo('invalid')).rejects.toThrow('Invalid GitHub URL');
    });

    it('should return cached analysis if bypassCache is false and cache hits', async () => {
      const mockCached = { meta: { name: 'cached' } };
      (cacheService.getAnalysis as jest.Mock).mockResolvedValue(mockCached);

      const result = await repoService.analyzeRepo('https://github.com/owner/repo');
      expect(result).toEqual(mockCached);
      expect(GithubService.prototype.fetchRepoMeta).not.toHaveBeenCalled();
    });

    it('should bypass cache, fetch from Github, parse and recache if cache misses or bypassCache is true', async () => {
      (cacheService.getAnalysis as jest.Mock).mockResolvedValue(null);

      const mockMeta = { defaultBranch: 'main', owner: 'owner', name: 'repo' };
      const mockTree = [
        { path: 'src/index.ts', type: 'blob' },
        { path: 'package.json', type: 'blob' },
        { path: 'node_modules/bad', type: 'blob' }
      ];

      (GithubService.prototype.fetchRepoMeta as jest.Mock).mockResolvedValue(mockMeta);
      (GithubService.prototype.fetchRepoTree as jest.Mock).mockResolvedValue(mockTree);
      (GithubService.prototype.bulkFetchFileContents as jest.Mock).mockImplementation((owner, repo, branch, files) => {
        const results: any = {};
        if (files.includes('package.json')) results['package.json'] = '{"name": "test-pkg"}';
        return Promise.resolve(results);
      });

      const result = await repoService.analyzeRepo('https://github.com/owner/repo', { bypassCache: true });

      // Verifies GitHub Calls
      expect(GithubService.prototype.fetchRepoMeta).toHaveBeenCalledWith('owner', 'repo');
      expect(GithubService.prototype.fetchRepoTree).toHaveBeenCalledWith('owner', 'repo', 'HEAD');
      expect(GithubService.prototype.bulkFetchFileContents).toHaveBeenCalled();

      // Verifies Parsing Logic
      expect(result.meta).toEqual(mockMeta);
      expect(result.keyFiles['package.json']).toBe('{"name": "test-pkg"}');
      
      // Verifies node_modules Is Ignored in Tree Outline
      expect(result.treePreview).toContain('src/index.ts');
      expect(result.treePreview).toContain('package.json');
      expect(result.treePreview).not.toContain('node_modules');

      // Verify Recache
      expect(cacheService.setAnalysis).toHaveBeenCalledWith('owner', 'repo', result);
    });
  });
});
