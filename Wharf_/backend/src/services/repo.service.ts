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

    // 1 + 2. Fetch Metadata & Tree In Parallel
    // GitHub Accepts 'HEAD' As Tree_Sha, So We Don't Need Meta First.
    // We Still Need Meta For Repo Description/Stars/Language Etc., But Both
    // Calls Are Completely Independent And Can Run Simultaneously.
    const [meta, tree] = await Promise.all([
      this.githubService.fetchRepoMeta(owner, repo),
      this.githubService.fetchRepoTree(owner, repo, 'HEAD'),
    ]);
    const filePaths = tree.map((item) => item.path);

    // 3. Fetch Key Files — With Concurrency Cap To Avoid GitHub Rate Limiting
    // Firing 40+ Simultaneous Requests Causes GitHub To Throttle Aggressively (3-8s Delay).
    // Batching To CONCURRENCY=5 Keeps Latency Predictable: Ceil(N/5) * ~200ms Per Batch.
    const keyFiles: Record<string, string> = {};
    const filesToFetch = [
      // Package Manifests & Configs
      'package.json',
      'requirements.txt',
      'Cargo.toml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'CMakeLists.txt',
      'Makefile',
      'pyproject.toml',
      'setup.py',
      // Env & Deployment Configs
      '.env.example',
      '.env.sample',
      'docker-compose.yml',
      'Dockerfile',
      'wrangler.toml',
      'vercel.json',
      'netlify.toml',
      'railway.json',
      // Entry Points
      'src/index.ts',
      'src/index.js',
      'src/server.ts',
      'src/server.js',
      'src/app.ts',
      'src/app.js',
      'src/main.ts',
      'src/main.js',
      'src/App.tsx',
      'src/main.tsx',
      'index.js',
      'index.ts',
      'server.js',
      'server.ts',
      'app.js',
      'app.ts',
      'main.py',
      'app.py',
      'main.go',
      'main.rs',
      'src/main.rs',
      'src/lib.rs',
      'main.c',
      'main.cpp',
      'index.html',
      // API Routes (Common Patterns)
      'src/routes/index.ts',
      'src/routes/index.js',
      'src/routes.ts',
      'src/routes.js',
      'routes/index.ts',
      'routes/index.js',
      'routes.ts',
      'routes.js',
      'src/api/index.ts',
      'src/api/index.js',
      'src/api/routes.ts',
      'src/api/routes.js',
      'src/router.ts',
      'src/router.js',
      'api/index.ts',
      'api/index.js',
      // Controllers
      'src/controllers/index.ts',
      'src/controllers/index.js',
    ];

    // Also Auto-Discover Route Files From The Tree
    const routePatterns = [
      /^src\/routes?\/.+\.(ts|js)$/,
      /^routes?\/.+\.(ts|js)$/,
      /^src\/api\/.+\.(ts|js)$/,
      /^api\/.+\.(ts|js)$/,
      /^src\/controllers?\/.+\.(ts|js)$/,
      /^controllers?\/.+\.(ts|js)$/,
    ];
    const discoveredRouteFiles = filePaths
      .filter((fp) => routePatterns.some((p) => p.test(fp)))
      .slice(0, 10); // Reduced From 20 To 10 To Limit Total Fetches

    const allFilesToFetch = Array.from(new Set([...filesToFetch, ...discoveredRouteFiles]));
    const matchedFiles = allFilesToFetch.filter((f) => filePaths.includes(f));

    // Concurrency-Limited Batch Fetcher — Groups Of 5 Parallel Requests
    const CONCURRENCY = 5;
    const fetchedContents: (string | null)[] = new Array(matchedFiles.length).fill(null);
    for (let i = 0; i < matchedFiles.length; i += CONCURRENCY) {
      const batch = matchedFiles.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map((f) => this.githubService.fetchFileContent(owner, repo, f))
      );
      results.forEach((content, idx) => {
        fetchedContents[i + idx] = content;
      });
    }
    matchedFiles.forEach((f, i) => {
      if (fetchedContents[i]) keyFiles[f] = fetchedContents[i]!;
    });

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
