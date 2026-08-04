export const aiMock = {
  generateText: vi.fn(),
  streamText: vi.fn(),
};

export const groqMock = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

export default { aiMock, groqMock };
