import { Request, Response } from 'express';
import { analyzeRepository, sendMessage, getHistory, getSession } from '../../../src/controllers/chat.controller';
import { chatService } from '../../../src/services/chat.service';
import prisma from '../../../src/db';
import { loggerService, saveRequestLog } from '../../../src/utils/logger';

jest.mock('../../../src/services/chat.service');
jest.mock('../../../src/utils/logger', () => ({
  loggerService: { info: jest.fn(), error: jest.fn() },
  saveRequestLog: jest.fn()
}));
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    chatSession: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() }
  }
}));

describe('ChatController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockWrite: jest.Mock;
  let mockSetHeader: jest.Mock;
  let mockEnd: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockWrite = jest.fn();
    mockSetHeader = jest.fn();
    mockEnd = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {}, query: {}, params: {}, user: { userId: 'u-1' }, baseUrl: '/api', path: '/chat', method: 'POST'
    };
    mockRes = { status: mockStatus, json: mockJson, write: mockWrite, setHeader: mockSetHeader, end: mockEnd };
  });

  describe('analyzeRepository', () => {
    it('should block if repoUrl is missing', async () => {
      await analyzeRepository(mockReq, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'repoUrl is required' });
    });

    it('should invoke chatService and return JSON', async () => {
      mockReq.body = { repoUrl: 'foo/bar' };
      (chatService.analyzeRepository as jest.Mock).mockResolvedValue({ outline: 'x' });
      await analyzeRepository(mockReq, mockRes as Response);
      expect(chatService.analyzeRepository).toHaveBeenCalledWith('foo/bar', 'u-1');
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: { outline: 'x' } });
    });
  });

  describe('sendMessage (Streaming)', () => {
    it('should create session if missing and stream AI response', async () => {
      mockReq.body = {
        sessionId: 'sess-1', question: 'how?', persona: 'pirate', repoUrl: 'repo'
      };
      
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.chatSession.create as jest.Mock).mockResolvedValue({ id: 'sess-1' });

      // Async Generator Mock
      const mockStream = (async function* () {
        yield 'shiver';
        yield ' me';
        yield ' timbers';
      })();

      (chatService.generateChatStream as jest.Mock).mockResolvedValue({ textStream: mockStream });

      await sendMessage(mockReq, mockRes as Response);

      expect(prisma.chatSession.create).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: 'shiver' })}\n\n`);
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: ' me' })}\n\n`);
      expect(mockEnd).toHaveBeenCalled();
      expect(saveRequestLog).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });
  });

  describe('getHistory & getSession', () => {
    it('getHistory should return user sessions', async () => {
      (prisma.chatSession.findMany as jest.Mock).mockResolvedValue([{ id: 'sess-1' }]);
      await getHistory(mockReq, mockRes as Response);
      expect(prisma.chatSession.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'u-1', isArchived: false }
      }));
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: [{ id: 'sess-1' }] });
    });

    it('getSession should return 404 if missing, else data', async () => {
      mockReq.params = { id: 'bad' };
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);
      await getSession(mockReq, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(404);
      
      mockReq.params = { id: 'good' };
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({ id: 'good' });
      await getSession(mockReq, mockRes as Response);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: { id: 'good' } });
    });
  });
});
