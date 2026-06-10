import { Request, Response } from 'express';
import { RepoService } from '../services/repo.service';
import { aiService } from '../services/ai.service';
import { cacheService } from '../services/cache.service';
import { parseGithubUrl } from '../utils/parseGithubUrl';
import { decrypt } from '../utils/encryption';
import prisma from '../db';

export const generateReadme = async (req: Request, res: Response) => {
  const { repoUrl, tone, sections } = req.body;
  const userId = (req as any).user?.userId;

  if (!repoUrl || !tone || !sections || !Array.isArray(sections)) {
    return res.status(400).json({ success: false, error: 'repoUrl, tone, and sections are required fields' });
  }

  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({ success: false, error: 'Invalid GitHub URL' });
  }

  const { owner, repo } = parsed;

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Check Redis Cache First
    const cachedReadme = await cacheService.getReadme(owner, repo, tone, sections);
    if (cachedReadme) {
      console.log(`[Cache] Cache hit for README: ${owner}/${repo}`);
      
      // Stream Cached Content In Chunks To Simulate Smooth Loading
      const chunkSize = 100;
      for (let i = 0; i < cachedReadme.length; i += chunkSize) {
        const chunk = cachedReadme.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 10)); // Short Delay For Smooth UI Stream
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Cache Miss: Proceed With Fetching Repository Analysis
    let token: string | undefined;
    let installationId: string | undefined;

    let encryptedToken = (req as any).user?.githubAccessToken;

    if (userId) {
      if (encryptedToken) {
        token = decrypt(encryptedToken);
      } else {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { githubAccessToken: true, installationId: true } as any,
          });

          if (user?.githubAccessToken) {
            token = decrypt(user.githubAccessToken);
          }
          if ((user as any)?.installationId) {
            installationId = (user as any).installationId;
          }
        } catch (dbErr: any) {
          console.warn('[DB Error] Failed to read user from DB in generate.controller:', dbErr.message);
        }
      }
    }

    const repoService = new RepoService({ token, installationId });
    const repoContext = await repoService.analyzeRepo(repoUrl);

    // Call AIService & Stream Back To User
    const generatedMarkdown = await aiService.generateReadmeStream(
      repoContext,
      tone,
      sections,
      userId,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );

    // Store In Cache
    await cacheService.setReadme(owner, repo, tone, sections, generatedMarkdown);

    // Save To Database Repository List If User Is Logged In
    if (userId) {
      try {
        const repository = await prisma.repository.upsert({
          where: {
            owner_name_userId: {
              owner,
              name: repo,
              userId,
            },
          },
          update: {
            description: repoContext.meta.description,
            stars: repoContext.meta.stars,
            language: repoContext.meta.language,
          },
          create: {
            owner,
            name: repo,
            userId,
            url: repoUrl,
            description: repoContext.meta.description,
            stars: repoContext.meta.stars,
            language: repoContext.meta.language,
          },
        });

        await prisma.generation.create({
          data: {
            type: 'README',
            content: generatedMarkdown,
            options: { tone, sections },
            repoId: repository.id,
          },
        });
      } catch (dbError) {
        console.error('Failed to save generation to DB:', dbError);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('README generation error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Failed to generate README' })}\n\n`);
    res.end();
  }
};
