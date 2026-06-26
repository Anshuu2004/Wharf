import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

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

  constructor(options?: { token?: string; installationId?: string }) {
    if (options?.installationId && process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY) {
      // Authenticate As A GitHub App Installation (High Rate Limits)
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY,
          installationId: options.installationId,
        },
      });
    } else {
      // Fallback To OAuth Token Or System Token
      this.octokit = new Octokit({
        auth: options?.token || process.env.GITHUB_TOKEN,
      });
    }
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

  // Fetches Authenticated User's Repositories
  async fetchUserRepos(page = 1, per_page = 100) {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page,
      page,
    });

    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      url: repo.html_url,
      owner: repo.owner.login,
    }));
  }

  // Fetches GitHub User Profile
  async getUserProfile(username: string) {
    const { data } = await this.octokit.users.getByUsername({ username });
    return data;
  }

  // Fetches Top Starred Repos (Used For Tech Stack Analysis)
  async getTopStarredRepos(username: string, limit = 10) {
    try {
      let isSelf = false;
      try {
        const { data: authUser } = await this.octokit.users.getAuthenticated();
        if (authUser.login.toLowerCase() === username.toLowerCase()) {
          isSelf = true;
        }
      } catch (authError) {
        // Not Authenticated As User
      }

      let data;
      if (isSelf) {
        const res = await this.octokit.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 50,
        });
        data = res.data;
      } else {
        const res = await this.octokit.repos.listForUser({
          username,
          sort: 'updated',
          per_page: 50,
        });
        data = res.data;
      }
      
      // Sort By Stars Descending
      return data.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, limit);
    } catch (error: any) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  // Fetches Languages For A Specific Repo
  async getRepoLanguages(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });
      return data as Record<string, number>;
    } catch (error: any) {
      return {};
    }
  }
}
