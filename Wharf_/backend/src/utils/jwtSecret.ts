// Returns the JWT secret from the environment, or throws if it isn't set.
// There is intentionally no default value, a missing secret should fail loudly.
export function getJwtSecret(env: { JWT_SECRET?: string }): string {
  const secret = env?.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim() === '') {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}
