import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import prisma from '../db';

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
          title: 'Chat Session',
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

    for await (const textPart of result.textStream) {
      // Escape Newlines For Valid JSON Parsing On Client
      const escapedText = JSON.stringify({ text: textPart });
      res.write(`data: ${escapedText}\n\n`);
    }

    res.write('data: "[DONE]"\n\n');
    res.end();
  } catch (error: any) {
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
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const sessions = await prisma.chatSession.findMany({
      where: { userId, isArchived: false },
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
