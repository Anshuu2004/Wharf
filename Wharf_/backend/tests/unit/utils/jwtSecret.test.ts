import { describe, it, expect } from 'vitest';
import { getJwtSecret } from '../../../src/utils/jwtSecret';

describe('getJwtSecret', () => {
  it('returns the secret when set', () => {
    expect(getJwtSecret({ JWT_SECRET: 'abc123' })).toBe('abc123');
  });

  it('throws when the secret is missing', () => {
    expect(() => getJwtSecret({})).toThrow('JWT_SECRET is not configured');
  });

  it('throws when the secret is empty or whitespace', () => {
    expect(() => getJwtSecret({ JWT_SECRET: '' })).toThrow();
    expect(() => getJwtSecret({ JWT_SECRET: '   ' })).toThrow();
  });
});
