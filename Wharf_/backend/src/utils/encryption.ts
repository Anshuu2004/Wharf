import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

// Encrypts A String Using AES-256-GCM
// Format: iv:authTag:encryptedContent
export function encrypt(text: string): string {
  if (!ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }

  // Ensure Secret Is 32 Bytes
  const key = crypto.scryptSync(ENCRYPTION_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

// Decrypts A String Encrypted With AES-256-GCM
export function decrypt(hash: string): string {
  if (!ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }

  const [ivHex, authTagHex, encryptedText] = hash.split(':');

  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error('Invalid encrypted text format');
  }

  const key = crypto.scryptSync(ENCRYPTION_SECRET, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
