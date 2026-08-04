import app from '../../src/index';

vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1' });
    await next();
  }
}));

vi.mock('../../src/services/chat.service', () => ({
  chatService: {
    analyzeRepository: vi.fn().mockResolvedValue({ summary: 'test repo' }),
    generateChatStream: vi.fn().mockResolvedValue({
      textStream: (async function*() { yield 'shiver'; })()
    })
  }
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    chatSession: {
      findUnique: vi.fn().mockResolvedValue({ id: 's-1', userId: 'u-1', repoUrl: 'foo/bar', repoData: { test: true } }),
      create: vi.fn().mockResolvedValue({ id: 's-1' }),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({ id: 's-1' }),
    }
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

describe('Chat Routes Integration', () => {
  describe('POST /api/chat/analyze', () => {
    it('should accept analyze requests and kick off processing', async () => {
      const res = await app.request('/api/chat/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'foo/bar' })
      });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/chat/message (SSE)', () => {
    it('should hook into node streaming properly', async () => {
      const res = await app.request('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 's-1', question: 'What does this repo do?', repoUrl: 'foo/bar', persona: 'assistant' })
      });
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('shiver');
    });
  });

  describe('GET /api/chat/history', () => {
    it('should retrieve chat history', async () => {
      const res = await app.request('/api/chat/history');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/chat/session/:id', () => {
    it('should retrieve a specific chat session', async () => {
      const res = await app.request('/api/chat/session/s-1');
      expect(res.status).toBe(200);
    });
  });
});
