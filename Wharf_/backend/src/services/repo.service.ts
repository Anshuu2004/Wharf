import { GithubService, RepoMeta } from './github.service';
import { detectFrameworks, getCommands } from '../utils/frameworkDetector';
import { parseGithubUrl } from '../utils/parseGithubUrl';

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

  async analyzeRepo(url: string): Promise<RepoContext> {
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      throw new Error('Invalid GitHub URL');
    }

    const { owner, repo } = parsed;

    // 1. Fetch Metadata
    const meta = await this.githubService.fetchRepoMeta(owner, repo);

    // 2. Fetch Tree
    const tree = await this.githubService.fetchRepoTree(owner, repo, meta.defaultBranch);
    const filePaths = tree.map(item => item.path);

    // 3. Fetch Key Files For Deeper Analysis
    const keyFiles: Record<string, string> = {};
    const filesToFetch = ['package.json', 'requirements.txt', 'README.md', 'docker-compose.yml'];
    
    for (const file of filesToFetch) {
      if (filePaths.includes(file)) {
        const content = await this.githubService.fetchFileContent(owner, repo, file);
        if (content) keyFiles[file] = content;
      }
    }

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

    // 5. Build Tree Preview (limited depth)
    const treePreview = tree
      .filter(item => !item.path.includes('node_modules') && !item.path.includes('.git'))
      .slice(0, 50)
      .map(item => item.path)
      .join('\n');

    return {
      meta,
      frameworks,
      commands,
      treePreview,
      keyFiles,
    };
  }
}
