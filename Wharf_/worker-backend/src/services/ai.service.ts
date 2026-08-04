import { KeyRouterService } from './keyRouter.service';
import { loggerService } from '../utils/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { buildReadmePrompt } from '../utils/promptBuilder';
import { buildProfilePrompt, ProfileData, ProfileOptions } from '../utils/profilePromptBuilder';
import { RepoContext } from './repo.service';

export class AiService {
  private keyRouter: KeyRouterService;

  constructor(dbUrl: string) {
    this.keyRouter = new KeyRouterService(dbUrl);
  }

  async generateReadmeStream(
    context: RepoContext,
    tone: 'technical' | 'recruiter' | 'beginner',
    sections: string[],
    userId?: string,
    onChunk?: (text: string) => void
  ): Promise<{ text: string; provider: string }> {
    const preferredProviders = ['GEMINI', 'GROQ', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'GROK'];
    let keyInfo = null;

    // Step 1: Check For User BYOK Key Across ALL Providers First
    if (userId) {
      for (const provider of preferredProviders) {
        keyInfo = await this.keyRouter.getUserKey(provider, userId);
        if (keyInfo) break;
      }
    }

    // Step 2: Only If No User Key Found, Fall Back To System Pool
    if (!keyInfo) {
      for (const provider of preferredProviders) {
        keyInfo = await this.keyRouter.getSystemKey(provider);
        if (keyInfo) break;
      }
    }

    if (!keyInfo) {
      throw new Error(
        'No API keys available for any supported provider. Please add your own API key in settings.'
      );
    }

    loggerService.providerSelected(keyInfo.provider.toUpperCase(), { keyType: keyInfo.isSystem ? 'system' : 'user', feature: 'README' });
    
    const promptStart = loggerService.stepStart();
    const prompt = buildReadmePrompt(context, tone, sections);
    loggerService.stepEnd('prompt.construction.completed', 'Prompt Construction', promptStart, { feature: 'README' });
    
    let fullText = '';
    const aiStart = loggerService.stepStart();

    try {
      loggerService.providerStarted(keyInfo.provider.toUpperCase(), { feature: 'README' });
      switch (keyInfo.provider.toUpperCase()) {
        case 'GEMINI': {
          const genAI = new GoogleGenerativeAI(keyInfo.key);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await model.generateContentStream(prompt);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'GROQ': {
          const groq = new Groq({ apiKey: keyInfo.key });
          const stream = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'OPENAI': {
          const openai = new OpenAI({ apiKey: keyInfo.key });
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'ANTHROPIC': {
          const anthropic = new Anthropic({ apiKey: keyInfo.key });
          const stream = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullText += text;
              if (onChunk) onChunk(text);
            }
          }
          break;
        }

        case 'DEEPSEEK': {
          const deepseek = new OpenAI({
            apiKey: keyInfo.key,
            baseURL: 'https://api.deepseek.com/v1',
          });
          const stream = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'GROK': {
          const grok = new OpenAI({ apiKey: keyInfo.key, baseURL: 'https://api.x.ai/v1' });
          const stream = await grok.chat.completions.create({
            model: 'grok-beta',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        default:
          throw new Error(`Unsupported provider: ${keyInfo.provider}`);
      }
      loggerService.providerCompleted(keyInfo.provider.toUpperCase(), Date.now() - aiStart, { feature: 'README' });
      return { text: fullText, provider: keyInfo.provider.toUpperCase() };
    } catch (error: any) {
      if (
        error.status === 429 ||
        error.status === 503 ||
        error.status === 403 ||
        error.message?.includes('429') ||
        error.message?.includes('503') ||
        error.message?.includes('403') ||
        error.status === 402 ||
        error.message?.includes('Failed to parse stream') ||
        error.message?.includes('Service Unavailable') ||
        error.message?.includes('Overloaded') ||
        error.message?.includes('Access denied')
      ) {
        loggerService.providerFallback(keyInfo.provider.toUpperCase(), 'NEXT_AVAILABLE', error);
        await this.keyRouter.markAsExhausted(keyInfo.id, keyInfo.isSystem);
        return this.generateReadmeStream(context, tone, sections, userId, onChunk);
      }
      loggerService.providerFailed(keyInfo.provider.toUpperCase(), error);
      throw error;
    }
  }

  async generateProfileStream(
    profileData: ProfileData,
    options: ProfileOptions,
    userId?: string,
    onChunk?: (text: string) => void
  ): Promise<{ text: string; provider: string }> {
    const preferredProviders = ['GEMINI', 'GROQ', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'GROK'];
    let keyInfo = null;

    // Step 1: Check For User BYOK Key Across ALL Providers First
    if (userId) {
      for (const provider of preferredProviders) {
        keyInfo = await this.keyRouter.getUserKey(provider, userId);
        if (keyInfo) break;
      }
    }

    // Step 2: Only If No User Key Found, Fall Back To System Pool
    if (!keyInfo) {
      for (const provider of preferredProviders) {
        keyInfo = await this.keyRouter.getSystemKey(provider);
        if (keyInfo) break;
      }
    }

    if (!keyInfo) {
      throw new Error(
        'No API keys available for any supported provider. Please add your own API key in settings.'
      );
    }

    loggerService.providerSelected(keyInfo.provider.toUpperCase(), { keyType: keyInfo.isSystem ? 'system' : 'user', feature: 'PROFILE' });
    const prompt = buildProfilePrompt(profileData, options);
    let fullText = '';
    const aiStart = loggerService.stepStart();

    try {
      loggerService.providerStarted(keyInfo.provider.toUpperCase(), { feature: 'PROFILE' });
      switch (keyInfo.provider.toUpperCase()) {
        case 'GEMINI': {
          const genAI = new GoogleGenerativeAI(keyInfo.key);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await model.generateContentStream(prompt);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'GROQ': {
          const groq = new Groq({ apiKey: keyInfo.key });
          const stream = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'OPENAI': {
          const openai = new OpenAI({ apiKey: keyInfo.key });
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'ANTHROPIC': {
          const anthropic = new Anthropic({ apiKey: keyInfo.key });
          const stream = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullText += text;
              if (onChunk) onChunk(text);
            }
          }
          break;
        }

        case 'DEEPSEEK': {
          const deepseek = new OpenAI({
            apiKey: keyInfo.key,
            baseURL: 'https://api.deepseek.com/v1',
          });
          const stream = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        case 'GROK': {
          const grok = new OpenAI({ apiKey: keyInfo.key, baseURL: 'https://api.x.ai/v1' });
          const stream = await grok.chat.completions.create({
            model: 'grok-beta',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            fullText += text;
            if (onChunk) onChunk(text);
          }
          break;
        }

        default:
          throw new Error(`Unsupported provider: ${keyInfo.provider}`);
      }
      loggerService.providerCompleted(keyInfo.provider.toUpperCase(), Date.now() - aiStart, { feature: 'PROFILE' });
      return { text: fullText, provider: keyInfo.provider.toUpperCase() };
    } catch (error: any) {
      if (
        error.status === 429 ||
        error.status === 503 ||
        error.status === 403 ||
        error.message?.includes('429') ||
        error.message?.includes('503') ||
        error.message?.includes('403') ||
        error.status === 402 ||
        error.message?.includes('Failed to parse stream') ||
        error.message?.includes('Service Unavailable') ||
        error.message?.includes('Overloaded') ||
        error.message?.includes('Access denied')
      ) {
        loggerService.providerFallback(keyInfo.provider.toUpperCase(), 'NEXT_AVAILABLE', error);
        await this.keyRouter.markAsExhausted(keyInfo.id, keyInfo.isSystem);
        return this.generateProfileStream(profileData, options, userId, onChunk);
      }
      loggerService.providerFailed(keyInfo.provider.toUpperCase(), error);
      throw error;
    }
  }

  async generateChangelogStream(prompt: string, userId?: string): Promise<{ stream: AsyncGenerator<string>; provider: string }> {
    const preferredProviders = ['GEMINI', 'GROQ', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'GROK'];
    let keyInfo = null;

    for (const provider of preferredProviders) {
      keyInfo = await this.keyRouter.getAvailableKey(provider, userId);
      if (keyInfo) break;
    }

    if (!keyInfo) {
      throw new Error('No API keys available for any supported provider.');
    }

    let generator: AsyncGenerator<string>;

    try {
      loggerService.providerStarted(keyInfo.provider.toUpperCase(), { feature: 'CHANGELOG' });
      switch (keyInfo.provider.toUpperCase()) {
        case 'GEMINI': {
          const genAI = new GoogleGenerativeAI(keyInfo.key);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await model.generateContentStream(prompt);
          generator = (async function* () {
            for await (const chunk of result.stream) {
              yield chunk.text();
            }
          })();
          break;
        }

        case 'GROQ': {
          const groq = new Groq({ apiKey: keyInfo.key });
          const stream = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          generator = (async function* () {
            for await (const chunk of stream) {
              yield chunk.choices[0]?.delta?.content || '';
            }
          })();
          break;
        }

        case 'OPENAI': {
          const openai = new OpenAI({ apiKey: keyInfo.key });
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          generator = (async function* () {
            for await (const chunk of stream) {
              yield chunk.choices[0]?.delta?.content || '';
            }
          })();
          break;
        }

        case 'ANTHROPIC': {
          const anthropic = new Anthropic({ apiKey: keyInfo.key });
          const stream = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          generator = (async function* () {
            for await (const event of stream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                yield event.delta.text;
              }
            }
          })();
          break;
        }

        case 'DEEPSEEK': {
          const deepseek = new OpenAI({
            apiKey: keyInfo.key,
            baseURL: 'https://api.deepseek.com/v1',
          });
          const stream = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          generator = (async function* () {
            for await (const chunk of stream) {
              yield chunk.choices[0]?.delta?.content || '';
            }
          })();
          break;
        }

        case 'GROK': {
          const grok = new OpenAI({ apiKey: keyInfo.key, baseURL: 'https://api.x.ai/v1' });
          const stream = await grok.chat.completions.create({
            model: 'grok-beta',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          });
          generator = (async function* () {
            for await (const chunk of stream) {
              yield chunk.choices[0]?.delta?.content || '';
            }
          })();
          break;
        }

        default:
          throw new Error(`Unsupported provider: ${keyInfo.provider}`);
      }
      return { stream: generator, provider: keyInfo.provider.toUpperCase() };
    } catch (error: any) {
      if (
        error.status === 429 ||
        error.status === 503 ||
        error.status === 403 ||
        error.message?.includes('429')
      ) {
        loggerService.providerFallback(keyInfo.provider.toUpperCase(), 'NEXT_AVAILABLE', error);
        await this.keyRouter.markAsExhausted(keyInfo.id, keyInfo.isSystem);
        return this.generateChangelogStream(prompt, userId);
      }
      loggerService.providerFailed(keyInfo.provider.toUpperCase(), error);
      throw error;
    }
  }
}


