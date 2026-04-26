import { Octokit } from '@octokit/rest';

export interface RepoMeta {
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  license: string | null;
  defaultBranch: string;
}

export interface RepoTreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export class GithubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    });
  }

  // Fetches Basic Repository Metadata
  async fetchRepoMeta(owner: string, repo: string): Promise<RepoMeta> {
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    });

    return {
      owner: data.owner.login,
      name: data.name,
      description: data.description,
      stars: data.stargazers_count,
      language: data.language,
      topics: data.topics || [],
      license: data.license?.spdx_id || null,
      defaultBranch: data.default_branch,
    };
  }

  // Fetches The Full Recursive File Tree Of A Repository
  async fetchRepoTree(owner: string, repo: string, branch: string): Promise<RepoTreeItem[]> {
    const { data } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: 'true',
    });

    return data.tree.map((item: any) => ({
      path: item.path,
      type: item.type === 'blob' ? 'blob' : 'tree',
      size: item.size,
    }));
  }

  // Fetches The Content Of A Specific File
  async fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in data && typeof data.content === 'string') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return null;
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  // Fetches The Recent Commit History
  async fetchCommitHistory(owner: string, repo: string, per_page = 20) {
    const { data } = await this.octokit.repos.listCommits({
      owner,
      repo,
      per_page,
    });

    return data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name,
      date: commit.commit.author?.date,
    }));
  }
}
