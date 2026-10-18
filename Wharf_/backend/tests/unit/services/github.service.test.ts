import { GithubService } from '../../../src/services/github.service';
import { 
  mockGet, mockGitTree, mockGetContent, mockListCommits, 
  mockListForAuthUser, mockGetByUsername 
} from '../../mocks/octokitStub';
import { githubCircuitBreaker } from '../../../src/utils/circuitBreaker';

vi.mock('@octokit/rest', async () => await import('../../mocks/octokitStub'));

vi.mock('../../../src/utils/circuitBreaker', () => ({
  githubCircuitBreaker: {
    fire: vi.fn((cb: any) => cb())
  }
}));

describe('GithubService', () => {
  let githubService: GithubService;

  beforeEach(() => {
    vi.clearAllMocks();
    githubService = new GithubService();
  });

  describe('fetchRepoMeta', () => {
    it('should format and return repository metadata', async () => {
      mockGet.mockResolvedValue({
        data: {
          owner: { login: 'FrostByte-49' },
          name: 'Wharf',
          description: 'AI Tools',
          stargazers_count: 42,
          language: 'TS',
          topics: ['ai', 'docs'],
          license: { spdx_id: 'MIT' },
          default_branch: 'main'
        }
      });

      const res = await githubService.fetchRepoMeta('FrostByte-49', 'Wharf');
      expect(res).toEqual({
        owner: 'FrostByte-49',
        name: 'Wharf',
        description: 'AI Tools',
        stars: 42,
        language: 'TS',
        topics: ['ai', 'docs'],
        license: 'MIT',
        defaultBranch: 'main'
      });
    });
  });

  describe('fetchRepoTree', () => {
    it('should format and return tree items', async () => {
      mockGitTree.mockResolvedValue({
        data: {
          tree: [
            { path: 'src', type: 'tree' },
            { path: 'package.json', type: 'blob', size: 100 }
          ]
        }
      });

      const res = await githubService.fetchRepoTree('Owner', 'Repo', 'main');
      expect(res).toEqual([
        { path: 'src', type: 'tree', size: undefined },
        { path: 'package.json', type: 'blob', size: 100 }
      ]);
    });
  });

  describe('fetchFileContent', () => {
    it('should decode base64 file content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('console.log("hi");')
      }) as any;

      const res = await githubService.fetchFileContent('Owner', 'Repo', 'index.ts');
      expect(res).toBe('console.log("hi");');
    });

    it('should return null if 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      }) as any;

      const res = await githubService.fetchFileContent('O', 'R', 'missing.json');
      expect(res).toBeNull();
    });
  });
});
