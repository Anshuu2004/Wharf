import request from 'supertest';
import app from '../../src/index';

jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1' };
    next();
  }
}));

jest.mock('../../src/services/chat.service', () => ({
  chatService: {
    analyzeRepository: jest.fn().mockResolvedValue({ summary: 'test repo' }),
    generateChatStream: jest.fn().mockResolvedValue({
      textStream: (async function*() { yield 'shiver'; })()
    })
  }
}));

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    chatSession: {
      // findUnique Returns A Session So The Message Flow Doesn't Need To Create One
      findUnique: jest.fn().mockResolvedValue({ id: 's-1', userId: 'u-1', repoUrl: 'foo/bar', repoData: { test: true } }),
      create: jest.fn().mockResolvedValue({ id: 's-1' }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 's-1' }),
    }
  }
}));

describe('Chat Routes Integration', () => {
  describe('POST /api/chat/analyze', () => {
    it('should accept analyze requests and kick off processing', async () => {
      const res = await request(app).post('/api/chat/analyze').send({ repoUrl: 'foo/bar' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/chat/message (SSE)', () => {
    it('should hook into node streaming properly', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .send({ sessionId: 's-1', question: 'What does this repo do?', repoUrl: 'foo/bar', persona: 'assistant' });
      expect(res.status).toBe(200);
      expect(res.text).toContain('shiver');
    });
  });

  describe('GET /api/chat/history', () => {
    it('should retrieve chat history', async () => {
      const res = await request(app).get('/api/chat/history');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/chat/session/:id', () => {
    it('should retrieve a specific chat session', async () => {
      const res = await request(app).get('/api/chat/session/s-1');
      expect(res.status).toBe(200);
    });
  });
});
