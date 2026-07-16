import prisma from '../db';
import { encrypt, decrypt } from '../utils/encryption';

export interface APIKeyInput {
  key: string;
  provider: string;
  label?: string;
}

// GitHub Verification
const verifyGitHubToken = async (
  token: string
): Promise<{ valid: boolean; user?: any; error?: string }> => {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 200) {
      const userData = await response.json();
      return { valid: true, user: userData };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid or expired token' };
    } else {
      return { valid: false, error: `GitHub API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying token' };
  }
};

// Anthropic Verification
const verifyAnthropicKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    if (response.status === 200 || response.status === 400) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying API key' };
  }
};

// OpenAI Verification
const verifyOpenAIKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying API key' };
  }
};

// Gemini Verification
const verifyGeminiKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (response.status === 200) {
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying API key' };
  }
};

// Groq Verification
const verifyGroqKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying API key' };
  }
};

// Grok (xAI) Verification
const verifyGrokKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.x.ai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying API key' };
  }
};

// DeepSeek Verification
const verifyDeepSeekKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: 'Network error while verifying API key' };
  }
};

export class APIKeyService {
  async addKey(userId: string, input: APIKeyInput) {
    // 1. Verify The Key First
    const verification = await this.verifyKey(input.key, input.provider);

    if (!verification.valid) {
      throw new Error(`Invalid API key: ${verification.error || 'Verification failed'}`);
    }

    // 2. Encrypt The Key
    const encryptedKey = encrypt(input.key);

    // 3. Normalise Provider To UPPERCASE For Consistent keyRouter Matching
    const normalizedProvider = input.provider.toUpperCase();

    // 4. Store The Key With Verification Status (Upsert So Re-adding Replaces)
    return await prisma.userApiKey.upsert({
      where: {
        userId_provider_label: {
          userId,
          provider: normalizedProvider,
          label: input.label || 'Primary',
        },
      },
      update: {
        key: encryptedKey,
        isVerified: true,
        isActive: true,
        isExhausted: false,
        lastVerifiedAt: new Date(),
        lastFour: input.key.slice(-4),
      },
      create: {
        userId,
        key: encryptedKey,
        provider: normalizedProvider,
        label: input.label || 'Primary',
        isVerified: true,
        lastVerifiedAt: new Date(),
        lastFour: input.key.slice(-4),
        isActive: true,
      },
    });
  }

  async verifyKey(apiKey: string, provider: string): Promise<{ valid: boolean; error?: string }> {
    switch (provider.toLowerCase()) {
      case 'github':
        return await verifyGitHubToken(apiKey);
      case 'anthropic':
        return await verifyAnthropicKey(apiKey);
      case 'openai':
        return await verifyOpenAIKey(apiKey);
      case 'gemini':
        return await verifyGeminiKey(apiKey);
      case 'groq':
        return await verifyGroqKey(apiKey);
      case 'grok':
        return await verifyGrokKey(apiKey);
      case 'deepseek':
        return await verifyDeepSeekKey(apiKey);
      default:
        return { valid: true };
    }
  }

  async getValidKey(userId: string, provider: string): Promise<string | null> {
    const apiKey = await prisma.userApiKey.findFirst({
      where: {
        userId,
        provider,
        isVerified: true,
        isActive: true,
        isExhausted: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: {
        lastUsed: 'asc', // Rotate Keys If Multiple
      },
    });

    if (!apiKey) return null;

    // Update Usage
    await prisma.userApiKey.update({
      where: { id: apiKey.id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    return decrypt(apiKey.key);
  }

  async revalidateKey(keyId: string): Promise<boolean> {
    const apiKey = await prisma.userApiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) return false;

    const decryptedKey = decrypt(apiKey.key);
    const verification = await this.verifyKey(decryptedKey, apiKey.provider);

    await prisma.userApiKey.update({
      where: { id: keyId },
      data: {
        isVerified: verification.valid,
        lastVerifiedAt: new Date(),
        verificationError: verification.valid ? null : verification.error,
        isActive: verification.valid ? true : false,
      },
    });

    return verification.valid;
  }

  async getKeysWithVerificationStatus(userId: string) {
    const keys = await prisma.userApiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((key) => ({
      id: key.id,
      provider: key.provider,
      label: key.label,
      lastFour: key.lastFour,
      isVerified: key.isVerified,
      createdAt: key.createdAt,
      status: this.getKeyStatus(key),
    }));
  }

  private getKeyStatus(key: any): 'valid' | 'invalid' | 'expired' | 'exhausted' {
    if (!key.isActive) return 'invalid';
    if (key.isExhausted) return 'exhausted';
    if (!key.isVerified) return 'invalid';
    if (key.expiresAt && key.expiresAt < new Date()) return 'expired';
    return 'valid';
  }
}
