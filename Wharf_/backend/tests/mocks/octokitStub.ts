import { jest } from '@jest/globals';

export const mockGet = jest.fn<any>();
export const mockGitTree = jest.fn<any>();
export const mockGetContent = jest.fn<any>();
export const mockListCommits = jest.fn<any>();
export const mockListForAuthUser = jest.fn<any>();
export const mockListForUser = jest.fn<any>();
export const mockGetByUsername = jest.fn<any>();
export const mockGetAuthenticated = jest.fn<any>();
export const mockListLanguages = jest.fn<any>();
export const mockGetReadme = jest.fn<any>();
export const mockListContributors = jest.fn<any>();
export const mockListTags = jest.fn<any>();
export const mockWrap = jest.fn<any>();

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

export const createAppAuth = jest.fn();
