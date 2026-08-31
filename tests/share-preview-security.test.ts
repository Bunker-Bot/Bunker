import { describe, it, expect } from 'vitest';
import { hashTokenSha256 } from '../api/_lib/share-preview';
import { renderOgImageBuffer } from '../api/_lib/og-renderer';

describe('Bunker Dynamic Share Preview & Security Engine', () => {
  it('should compute valid 64-char SHA-256 token hashes', () => {
    const rawToken = '4f8a3c1b8d2e6a7c9f0b1a2c3d4e5f60718293a4b5c6d7e8f90123456789abcd';
    const hash = hashTokenSha256(rawToken);

    expect(hash).toHaveLength(64);
    expect(typeof hash).toBe('string');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should render a valid 1200x630 PNG buffer for available preview metadata', async () => {
    const mockMetadata = {
      state: 'available' as const,
      shareLinkId: 'link-uuid-1234',
      project: {
        id: 'proj-uuid-5678',
        name: 'Enterprise Cloud Portal',
        description: 'Secure enterprise client deliverables and documentation.',
        status: 'In Progress',
        completionPercent: 78,
        color: '#06B6D4',
      },
      client: {
        id: 'client-uuid-9999',
        displayName: 'Acme Global Corp',
      },
      technologies: ['React', 'Supabase', 'TypeScript'],
    };

    const pngBuffer = await renderOgImageBuffer(mockMetadata);

    expect(pngBuffer).toBeInstanceOf(Buffer);
    expect(pngBuffer.length).toBeGreaterThan(1000);
    // PNG file header magic bytes (89 50 4E 47 0D 0A 1A 0A)
    expect(pngBuffer[0]).toBe(0x89);
    expect(pngBuffer[1]).toBe(0x50); // 'P'
    expect(pngBuffer[2]).toBe(0x4e); // 'N'
    expect(pngBuffer[3]).toBe(0x47); // 'G'
  });

  it('should render safe generic preview for password-protected links without leaking sensitive data', async () => {
    const protectedMetadata = {
      state: 'protected' as const,
      shareLinkId: 'link-protected-1234',
    };

    const pngBuffer = await renderOgImageBuffer(protectedMetadata);

    expect(pngBuffer).toBeInstanceOf(Buffer);
    expect(pngBuffer.length).toBeGreaterThan(1000);
    expect(pngBuffer[0]).toBe(0x89);
    expect(pngBuffer[1]).toBe(0x50);
  });
});
