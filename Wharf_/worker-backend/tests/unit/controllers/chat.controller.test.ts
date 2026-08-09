import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { analyzeRepository, sendMessage, getHistory, getSession } from '../../../src/controllers/chat.controller';
import { ChatService } from '../../../src/services/chat.service';
import { createMockContext } from '../test-utils';

let streamBuffer = '';

vi.mock('hono/streaming', () => {
  const mockStreamFunc = vi.fn().mockImplementation(async (c: any, cb: any) => {
    const stream = {
      write: vi.fn().mockImplementation((chunk: any) => {
        streamBuffer += chunk;
        return Promise.resolve();
      })
    };
    await cb(stream);
    return { _isHonoResponse: true, streamed: true, buffer: streamBuffer };
  });
  return { streamText: mockStreamFunc, stream: mockStreamFunc };
});

vi.mock('../../../src/services/chat.service');
vi.mock('../../../src/utils/logger', () => ({
  loggerService: { info: vi.fn(), error: vi.fn() },
  saveRequestLog: vi.fn()
}));
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    chatSession: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() }
  })
}));

describe('ChatController', () => {
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    streamBuffer = '';
    vi.clearAllMocks();
    mockEnv = { DATABASE_URL: 'postgres://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
  });

  describe('analyzeRepository', () => {
    it('should block if repoUrl is missing', async () => {
      const c = createMockContext({ body: {} }, mockEnv, null);
      await analyzeRepository(c);
      expect(c.json).toHaveBeenCalledWith({ success: false, error: 'repoUrl is required' }, 400);
    });

    it('should invoke chatService and return JSON', async () => {
      const c = createMockContext({ body: { repoUrl: 'foo/bar' } }, mockEnv, { userId: 'u-1' });
      (ChatService.prototype.analyzeRepository as Mock).mockResolvedValue({ outline: 'x' });
      await analyzeRepository(c);
      expect(ChatService.prototype.analyzeRepository).toHaveBeenCalledWith('foo/bar', 'u-1');
      expect(c.json).toHaveBeenCalledWith({ success: true, data: { outline: 'x' } });
    });
  });

  describe('sendMessage (Streaming)', () => {
    it('should create session if missing and stream AI response', async () => {
      const c = createMockContext({
        body: { sessionId: 'sess-1', question: 'how?', persona: 'pirate', repoUrl: 'repo' }
      }, mockEnv, { userId: 'u-1' });
      
      (prismaObj.chatSession.findUnique as Mock).mockResolvedValue(null);
      (prismaObj.chatSession.create as Mock).mockResolvedValue({ id: 'sess-1' });

      const mockStream = (async function* () {
        yield 'shiver';
        yield ' me';
        yield ' timbers';
      })();

      (ChatService.prototype.generateChatStream as Mock).mockResolvedValue({ textStream: mockStream });

      await sendMessage(c);

      expect(prismaObj.chatSession.create).toHaveBeenCalled();
      expect(prismaObj.chatSession.create).toHaveBeenCalled();
      
      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: 'shiver' })}\n\n`);
      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: ' me' })}\n\n`);
    });
  });

  describe('getHistory & getSession', () => {
    it('getHistory should return user sessions', async () => {
      const c = createMockContext({ query: {} }, mockEnv, { userId: 'u-1' });
      (prismaObj.chatSession.findMany as Mock).mockResolvedValue([{ id: 'sess-1' }]);
      
      await getHistory(c);
      
      expect(prismaObj.chatSession.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'u-1', isArchived: false }
      }));
      expect(c.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'sess-1' }] });
    });

    it('getSession should return 404 if missing, else data', async () => {
      const c404 = createMockContext({ params: { id: 'bad' } }, mockEnv, { userId: 'u-1' });
      (prismaObj.chatSession.findUnique as Mock).mockResolvedValue(null);
      await getSession(c404);
      expect(c404.json).toHaveBeenCalledWith({ success: false, error: 'Session not found' }, 404);
      
      const c = createMockContext({ params: { id: 'good' } }, mockEnv, { userId: 'u-1' });
      (prismaObj.chatSession.findUnique as Mock).mockResolvedValue({ id: 'good' });
      await getSession(c);
      expect(c.json).toHaveBeenCalledWith({ success: true, data: { id: 'good' } });
    });
  });
});
