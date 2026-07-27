import { ChatSession, ChatMessage, ChatAnalytics } from '@prisma/client';

export const buildChatSession = (overrides: Partial<ChatSession> = {}): ChatSession => ({
  id: 'mock-session-cuid',
  userId: 'mock-user-cuid',
  title: 'Mock Chat Analysis',
  repoUrl: 'https://github.com/test/test',
  repoData: null,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const buildChatMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'mock-msg-cuid',
  sessionId: 'mock-session-cuid',
  role: 'user',
  content: 'Hello World',
  codeBlocks: null,
  tokens: 10,
  createdAt: new Date(),
  ...overrides,
});

export const buildChatAnalytics = (overrides: Partial<ChatAnalytics> = {}): ChatAnalytics => ({
  id: 'mock-analytics-cuid',
  sessionId: 'mock-session-cuid',
  totalTokens: 1500,
  totalMessages: 2,
  avgResponseTime: 850.5,
  createdAt: new Date(),
  ...overrides,
});
