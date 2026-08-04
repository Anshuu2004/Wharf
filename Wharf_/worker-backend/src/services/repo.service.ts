import { GithubService, RepoMeta } from './github.service';
import { detectFrameworks, getCommands } from '../utils/frameworkDetector';
import { loggerService } from '../utils/logger';
import { parseGithubUrl } from '../utils/parseGithubUrl';
import { cacheService } from './cache.service';

export interface RepoContext {
  meta: RepoMeta;
  frameworks: string[];
  commands: { install: string; run: string };
  treePreview: string;
  keyFiles: Record<string, string>;
}

export class RepoService {
  private githubService: GithubService;

  constructor(options?: { token?: string; installationId?: string }) {
    this.githubService = new GithubService(options);
  }

  async analyzeRepo(url: string, options?: { bypassCache?: boolean }): Promise<RepoContext> {
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      throw new Error('Invalid GitHub URL');
    }

    const { owner, repo } = parsed;

    // Try To Get From Cache First
    if (!options?.bypassCache) {
      const cacheLookupStart = loggerService.stepStart();
      const cached = await cacheService.getAnalysis(owner, repo);
      // If We Got A Result, Cache Lookup & Parse Are Handled via Standard Fallback Routes
      if (cached) {
        loggerService.stepEnd('cache.lookup.completed', 'Redis Lookup', cacheLookupStart, {
          repository: `${owner}/${repo}`,
        });
        // Assume Minimal Parse Time Since It's Already An Object, Or We Just Leave Caching As Is
        return cached;
      }
    }

    const githubStart = loggerService.stepStart();
    // 1. Fetch Metadata
    const meta = await this.githubService.fetchRepoMeta(owner, repo);

    // 2. Fetch Tree
    const tree = await this.githubService.fetchRepoTree(owner, repo, meta.defaultBranch);
    const filePaths = tree.map((item) => item.path);

    // 3. Fetch Key Files For Deeper Analysis
    const keyFiles: Record<string, string> = {};
    const filesToFetch = [
      'package.json',
      'requirements.txt',
      'README.md',
      'docker-compose.yml',
      'src/index.ts',
      'src/App.tsx',
      'src/main.tsx',
      'src/server.ts',
      'main.py',
      'app.py',
      'index.html',
      'Cargo.toml',
      'src/main.rs',
      'src/lib.rs',
      'go.mod',
      'main.go',
      'pom.xml',
      'build.gradle',
      'CMakeLists.txt',
      'Makefile',
      'main.c',
      'main.cpp',
    ];

    for (const file of filesToFetch) {
      if (filePaths.includes(file)) {
        const content = await this.githubService.fetchFileContent(owner, repo, file);
        if (content) keyFiles[file] = content;
      }
    }
    loggerService.stepEnd('github.fetch.completed', 'GitHub Fetch', githubStart, {
      repository: `${owner}/${repo}`,
    });

    const parseStart = loggerService.stepStart();
    // 4. Detect Frameworks
    let packageJson = null;
    if (keyFiles['package.json']) {
      try {
        packageJson = JSON.parse(keyFiles['package.json']);
      } catch (e) {
        console.error('Failed to parse package.json');
      }
    }

    const frameworks = detectFrameworks(filePaths, packageJson);
    const commands = getCommands(frameworks);

    // 5. Build Tree Preview
    const ignoreFolders = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'out',
      'bin',
      'obj',
      '.cache',
      '.next',
      'coverage',
      '.vscode',
      '.idea',
      'vendor',
      'venv',
      '.venv',
      '__pycache__',
    ];
    const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store'];

    const treePreview = tree
      .filter((item) => {
        const pathSegments = item.path.split('/');
        if (pathSegments.some((seg) => ignoreFolders.includes(seg))) return false;
        if (ignoreFiles.includes(pathSegments[pathSegments.length - 1])) return false;
        return true;
      })
      .slice(0, 500)
      .map((item) => item.path)
      .join('\n');

    const result = {
      meta,
      frameworks,
      commands,
      treePreview,
      keyFiles,
    };
    loggerService.stepEnd('repository.parse.completed', 'Repository Parse', parseStart, {
      repository: `${owner}/${repo}`,
    });

    // Cache The Result
    await cacheService.setAnalysis(owner, repo, result);

    return result;
  }
}
