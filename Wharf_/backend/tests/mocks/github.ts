export const githubMock = {
  rest: {
    users: {
      getByUsername: jest.fn(),
    },
    repos: {
      get: jest.fn(),
      listForUser: jest.fn(),
      listCommits: jest.fn(),
      getContent: jest.fn(),
    },
  },
  graphql: jest.fn(),
};

export default githubMock;
