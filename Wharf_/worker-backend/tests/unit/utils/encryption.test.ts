import { encrypt, decrypt } from '../../../src/utils/encryption';
import { describe, expect, test, beforeAll, afterAll } from 'vitest';

describe('encryption Utility', () => {
  const originalEnv = process.env;

  beforeAll(() => {
    // Clone envs & Set Mock Secret
    process.env = { ...originalEnv, ENCRYPTION_SECRET: 'test-secret-min-32-chars-long-so-crypto-happy' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should successfully encrypt and decrypt a string with valid secret', () => {
    const plainText = 'Hello, this is a secret!';
    const encrypted = encrypt(plainText);
    
    expect(encrypted).toContain(':');
    expect(encrypted).not.toEqual(plainText);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(plainText);
  });

  test('should throw error during decryption of invalid format', () => {
    expect(() => decrypt('invalid-format-string-without-colons')).toThrow('Invalid encrypted text format');
  });

  test('should throw if ENCRYPTION_SECRET is undefined', () => {
    process.env.ENCRYPTION_SECRET = '';

    expect(() => encrypt('test')).toThrow('ENCRYPTION_SECRET is not defined');
    expect(() => decrypt('iv:auth:enc')).toThrow('ENCRYPTION_SECRET is not defined');

    // Restore For Other Tests If Any
    process.env.ENCRYPTION_SECRET = 'test-secret-min-32-chars-long-so-crypto-happy';
  });
});
