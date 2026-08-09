import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

// Use .dev.vars If It Exists (Cloudflare Workers Standard)
if (fs.existsSync('.dev.vars')) {
  dotenv.config({ path: '.dev.vars' });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

// Helper To Encrypt
function encrypt(text: string): string {
  if (!ENCRYPTION_SECRET) throw new Error('ENCRYPTION_SECRET missing');
  const key = crypto.scryptSync(ENCRYPTION_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
  console.log('--- SEEDING SYSTEM KEYS ---');

  const providers = ['GEMINI', 'ANTHROPIC', 'OPENAI', 'GROQ', 'DEEPSEEK', 'PROXY_OPENAI'];

  for (const provider of providers) {
    const keys: { key: string, name: string }[] = [];
    
    // Check For Single Key
    if (process.env[`SEED_${provider}_KEY`]) {
      keys.push({ key: process.env[`SEED_${provider}_KEY`]!, name: `SEED_${provider}_KEY` });
    }

    // Check For Numbered Keys (1 to 50)
    for (let i = 1; i <= 50; i++) {
      const varName = `SEED_${provider}_KEY_${i}`;
      const key = process.env[varName];
      if (key) keys.push({ key, name: varName });
    }

    if (keys.length === 0) {
      console.log(`No keys found for ${provider}, skipping...`);
      continue;
    }

    for (const keyObj of keys) {
      const encryptedKey = encrypt(keyObj.key);
      
      await (prisma as any).systemKey.create({
        data: {
          name: keyObj.name,
          provider: provider,
          key: encryptedKey,
        },
      });
      
      console.log(`Successfully added a ${provider} key (${keyObj.name}) to system pool.`);
    }
  }

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
