/**
 * Generate 32-byte (256-bit entropy) cryptographically secure random raw token
 */
export function generate32ByteRawToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compute SHA-256 hash of token to store in the database instead of plaintext
 */
export async function hashTokenSHA256(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash password securely using Web Crypto SHA-256 with custom salting
 */
export async function hashPasswordSecurely(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`bunker_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create token preview string (e.g. ********H8FK9QA) showing only last 8 characters
 */
export function createTokenPreview(rawToken: string): string {
  if (!rawToken || rawToken.length <= 8) return rawToken;
  return `••••••••${rawToken.slice(-8)}`;
}
