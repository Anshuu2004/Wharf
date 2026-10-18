export const aiMock = {
  generateText: jest.fn(),
  streamText: jest.fn(),
};

export const groqMock = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

export default { aiMock, groqMock };
