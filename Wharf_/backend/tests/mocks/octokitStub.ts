import { vi } from 'vitest';

export const mockGet = vi.fn<any>();
export const mockGitTree = vi.fn<any>();
export const mockGetContent = vi.fn<any>();
export const mockListCommits = vi.fn<any>();
export const mockListForAuthUser = vi.fn<any>();
export const mockListForUser = vi.fn<any>();
export const mockGetByUsername = vi.fn<any>();
export const mockGetAuthenticated = vi.fn<any>();
export const mockListLanguages = vi.fn<any>();
export const mockGetReadme = vi.fn<any>();
export const mockListContributors = vi.fn<any>();
export const mockListTags = vi.fn<any>();
export const mockWrap = vi.fn<any>();

export class Octokit {
  constructor() {}

  repos = {
    get: mockGet,
    getContent: mockGetContent,
    listCommits: mockListCommits,
    listForAuthenticatedUser: mockListForAuthUser,
    listForUser: mockListForUser,
    listLanguages: mockListLanguages,
    getReadme: mockGetReadme,
    listContributors: mockListContributors,
    listTags: mockListTags,
  };

  git = {
    getTree: mockGitTree,
  };

  users = {
    getByUsername: mockGetByUsername,
    getAuthenticated: mockGetAuthenticated,
  };

  hook = {
    wrap: mockWrap,
  };
}

export const createAppAuth = vi.fn();
