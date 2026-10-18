import { Context } from 'hono';
import { stream } from 'hono/streaming';
import { ChatService } from '../services/chat.service';
import { getPrisma } from '../db';
import { loggerService, saveRequestLog } from '../utils/logger';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any; contextStore: any } }>;

export const analyzeRepository = async (c: AppContext) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { repoUrl } = body;
    const user = c.get('user');
    const userId = user?.userId || user?.id;

    if (!repoUrl) return c.json({ success: false, error: 'repoUrl is required' }, 400);

    const chatService = new ChatService(c.env.DATABASE_URL);
    const data = await chatService.analyzeRepository(repoUrl, userId);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const sendMessage = async (c: AppContext) => {
  const reqStart = Date.now();
  try {
    const body = await c.req.json().catch(() => ({}));
    const { sessionId, question, persona, repoUrl, history = [], repoData } = body;
    const user = c.get('user');
    const userId = user?.userId || user?.id;

    if (!sessionId || !question || !repoUrl || !persona) {
      return c.json({ success: false, error: 'Missing required parameters' }, 400);
    }

    const prisma = getPrisma(c.env.DATABASE_URL);
    let session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session && userId) {
      session = await prisma.chatSession.create({
        data: {
          id: sessionId,
          userId,
          title: repoData ? `${repoData.owner}/${repoData.name}` : (question.slice(0, 30) + (question.length > 30 ? '...' : '')),
          repoUrl,
          repoData: repoData || undefined,
        },
      });
    } else if (session && repoData && !session.repoData) {
      session = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { repoData, repoUrl },
      });
    }

    const chatService = new ChatService(c.env.DATABASE_URL);
    const result = await chatService.generateChatStream(
      repoUrl,
      question,
      persona,
      history,
      sessionId,
      userId
    );

    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    return stream(c, async (streamStr) => {
      try {
        for await (const textPart of result.textStream) {
          const escapedText = JSON.stringify({ text: textPart });
          await streamStr.write(`data: ${escapedText}\n\n`);
        }
        await streamStr.write('data: "[DONE]"\n\n');
      } catch (streamError: any) {
        // Mid-Stream Error (e.g. Groq 403 Blocked By VPN)
        const isVpn = ChatService.isVpnOrAccessError(streamError);
        const errorMsg = isVpn
          ? 'Connection Blocked By Groq. Please Turn Off Your VPN And Try Again.'
          : (streamError?.message || 'Stream Failed Unexpectedly.');
        await streamStr.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
        await streamStr.write('data: "[DONE]"\n\n');
        loggerService.error('chat.stream.error', 'Mid-stream error in chat', streamError);
      }

      loggerService.info('chat.generation.completed', 'Chat generated successfully', {
        repository: repoUrl,
        durationMs: Date.now() - reqStart,
      });
      await saveRequestLog({
        route: c.req.path,
        method: c.req.method,
        feature: 'CHAT',
        statusCode: 200,
        cacheHit: false,
        totalDurationMs: Date.now() - reqStart,
      });
    });
  } catch (error: any) {
    loggerService.error('chat.generation.error', 'Chat generation error', error);
    await saveRequestLog({
      route: c.req.path,
      method: c.req.method,
      feature: 'CHAT',
      statusCode: 500,
      error: error.message,
      totalDurationMs: Date.now() - reqStart,
    });
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    return stream(c, async (streamStr) => {
      await streamStr.write(`data: ${JSON.stringify({ success: false, error: error.message })}\n\n`);
    });
  }
};

export const getHistory = async (c: AppContext) => {
  try {
    const user = c.get('user');
    const userId = user?.userId || user?.id;
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200);
    const skip = (page - 1) * limit;

    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const prisma = getPrisma(c.env.DATABASE_URL);
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

    return c.json({ success: true, data: sessions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const getSession = async (c: AppContext) => {
  try {
    const id = c.req.param('id');
    const prisma = getPrisma(c.env.DATABASE_URL);
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) return c.json({ success: false, error: 'Session not found' }, 404);
    return c.json({ success: true, data: session });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};
