/**
 * 10-Digit Avatar Code Helper & Validator
 */

export const AVATAR_CODE_REGEX = /^[0-9]{10}$/;

/**
 * Validates whether an avatar code is exactly 10 numeric digits.
 */
export function validateAvatarCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const clean = cleanAvatarCode(code);
  return AVATAR_CODE_REGEX.test(clean);
}

/**
 * Strips leading hash and whitespace.
 */
export function cleanAvatarCode(code: string | null | undefined): string {
  if (!code) return '';
  return code.trim().replace(/^#/, '');
}

/**
 * Formats a 10-digit code with visual prefix `#`.
 */
export function formatAvatarCode(code: string | null | undefined): string {
  if (!code) return '#0000000000';
  const clean = cleanAvatarCode(code);
  return `#${clean}`;
}

/**
 * Client-side fallback code generator if offline/mocking (10 digits).
 */
export function generateClientAvatarCode(): string {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  return digits;
}

/**
 * Copies avatar code to clipboard with clean format.
 */
export async function copyAvatarCodeToClipboard(code: string): Promise<boolean> {
  try {
    const clean = cleanAvatarCode(code);
    await navigator.clipboard.writeText(clean);
    return true;
  } catch (err) {
    console.error('Failed to copy avatar code:', err);
    return false;
  }
}
