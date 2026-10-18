import { Request, Response } from 'express';
import { chatService, ChatService } from '../services/chat.service';
import prisma from '../db';
import { loggerService, saveRequestLog } from '../utils/logger';

export const analyzeRepository = async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!repoUrl) return res.status(400).json({ success: false, error: 'repoUrl is required' });

    const data = await chatService.analyzeRepository(repoUrl, userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const reqStart = Date.now();
  const reqId = String((req as any).id);
  try {
    const { sessionId, question, persona, repoUrl, history = [] } = req.body;

    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!sessionId || !question || !repoUrl || !persona) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    // Ensure Session Exists Or Create One
    let session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session && userId) {
      session = await prisma.chatSession.create({
        data: {
          id: sessionId,
          userId,
          title: req.body.repoData ? (() => { try { const d = typeof req.body.repoData === 'string' ? JSON.parse(req.body.repoData) : req.body.repoData; return d?.owner && d?.name ? `${d.owner}/${d.name}` : question.slice(0, 30); } catch { return question.slice(0, 30); } })() : question.slice(0, 30),
          repoUrl,
          repoData: req.body.repoData || undefined,
        },
      });
    } else if (session && req.body.repoData && !session.repoData) {
      session = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { repoData: req.body.repoData, repoUrl },
      });
    }

    const result = await chatService.generateChatStream(
      repoUrl,
      question,
      persona,
      history,
      sessionId,
      userId
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const textPart of result.textStream) {
        const escapedText = JSON.stringify({ text: textPart });
        res.write(`data: ${escapedText}\n\n`);
      }
      res.write('data: "[DONE]"\n\n');
      res.end();
    } catch (streamError: any) {
      // Mid-Stream Error (e.g. Groq 403 Blocked By VPN)
      const isVpn = ChatService.isVpnOrAccessError(streamError);
      const errorMsg = isVpn
        ? 'Connection Blocked By Groq. Please Turn Off Your VPN And Try Again.'
        : (streamError?.message || 'Stream Failed Unexpectedly.');
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.write('data: "[DONE]"\n\n');
      res.end();
      loggerService.error('chat.stream.error', 'Mid-stream error in chat', streamError);
    }

    loggerService.info('chat.generation.completed', 'Chat generated successfully', {
      repository: repoUrl,
      durationMs: Date.now() - reqStart,
    });
    await saveRequestLog({
      route: req.baseUrl + req.path,
      method: req.method,
      feature: 'CHAT',
      statusCode: 200,
      cacheHit: false,
      totalDurationMs: Date.now() - reqStart,
    });
  } catch (error: any) {
    loggerService.error('chat.generation.error', 'Chat generation error', error);
    await saveRequestLog({
      route: req.baseUrl + req.path,
      method: req.method,
      feature: 'CHAT',
      statusCode: 500,
      error: error.message,
      totalDurationMs: Date.now() - reqStart,
    });
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.end();
    }
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const sessions = await prisma.chatSession.findMany({
      where: { userId, isArchived: false },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
