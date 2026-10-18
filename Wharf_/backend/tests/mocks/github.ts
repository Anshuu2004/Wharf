export const githubMock = {
  rest: {
    users: {
      getByUsername: vi.fn(),
    },
    repos: {
      get: vi.fn(),
      listForUser: vi.fn(),
      listCommits: vi.fn(),
      getContent: vi.fn(),
    },
  },
  graphql: vi.fn(),
};

export default githubMock;
