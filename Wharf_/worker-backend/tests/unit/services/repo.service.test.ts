import type { Mock } from "vitest";
import { RepoService } from '../../../src/services/repo.service';
import { GithubService } from '../../../src/services/github.service';
import { cacheService } from '../../../src/services/cache.service';

vi.mock('../../../src/services/github.service');
vi.mock('../../../src/services/cache.service');
vi.mock('../../../src/utils/parseGithubUrl', () => ({
  parseGithubUrl: vi.fn((url: string) => {
    if (url === 'invalid') return null;
    return { owner: 'owner', repo: 'repo' };
  })
}));
vi.mock('../../../src/utils/logger', () => ({
  loggerService: {
    stepStart: vi.fn(),
    stepEnd: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }
}));

describe('RepoService', () => {
  let repoService: RepoService;

  beforeEach(() => {
    vi.clearAllMocks();
    repoService = new RepoService();
  });

  describe('analyzeRepo', () => {
    it('should throw an error for invalid github url', async () => {
      await expect(repoService.analyzeRepo('invalid')).rejects.toThrow('Invalid GitHub URL');
    });

    it('should return cached analysis if bypassCache is false and cache hits', async () => {
      const mockCached = { meta: { name: 'cached' } };
      (cacheService.getAnalysis as Mock).mockResolvedValue(mockCached);

      const result = await repoService.analyzeRepo('https://github.com/owner/repo');
      expect(result).toEqual(mockCached);
      expect(GithubService.prototype.fetchRepoMeta).not.toHaveBeenCalled();
    });

    it('should bypass cache, fetch from Github, parse and recache if cache misses or bypassCache is true', async () => {
      (cacheService.getAnalysis as Mock).mockResolvedValue(null);

      const mockMeta = { defaultBranch: 'main', owner: 'owner', name: 'repo' };
      const mockTree = [
        { path: 'src/index.ts', type: 'blob' },
        { path: 'package.json', type: 'blob' },
        { path: 'node_modules/bad', type: 'blob' }
      ];

      (GithubService.prototype.fetchRepoMeta as Mock).mockResolvedValue(mockMeta);
      (GithubService.prototype.fetchRepoTree as Mock).mockResolvedValue(mockTree);
      (GithubService.prototype.fetchFileContent as Mock).mockImplementation((owner: any, repo: any, file: any) => {
        if (file === 'package.json') return Promise.resolve('{"name": "test-pkg"}');
        return Promise.resolve(null);
      });

      const result = await repoService.analyzeRepo('https://github.com/owner/repo', { bypassCache: true });

      // Verifies GitHub Calls
      expect(GithubService.prototype.fetchRepoMeta).toHaveBeenCalledWith('owner', 'repo');
      expect(GithubService.prototype.fetchRepoTree).toHaveBeenCalledWith('owner', 'repo', 'HEAD');
      expect(GithubService.prototype.fetchFileContent).toHaveBeenCalledWith('owner', 'repo', 'package.json');

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
