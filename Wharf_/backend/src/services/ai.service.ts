import { KeyRouterService } from './keyRouter.service';

export class AiService {
  private keyRouter: KeyRouterService;

  constructor() {
    this.keyRouter = new KeyRouterService();
  }

// Generates A README Using The Best Available Key
  async generateReadme(context: any, userId?: string) {
    // Prioritize GEMINI As The Default System Provider
    const keyInfo = await this.keyRouter.getAvailableKey('GEMINI', userId);

    if (!keyInfo) {
      throw new Error('No API keys available. Please add your own API key in settings.');
    }

    console.log(`[AI] Using ${keyInfo.isSystem ? 'System' : 'User'} key for ${keyInfo.provider}`);
    
    // TODO: Implement actual AI calls in Phase 3
    return `Generated README for repo using ${keyInfo.provider}`;
  }
}
