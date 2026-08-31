import { describe, it, expect } from 'vitest';
import {
  validateAvatarCode,
  formatAvatarCode,
  cleanAvatarCode,
  generateClientAvatarCode,
} from '../src/features/identity-avatar/lib/avatar-code';
import { generateAvatarConfig } from '../src/features/identity-avatar/lib/avatar-generator';
import { AvatarService } from '../src/features/identity-avatar/data/avatar.service';
import {
  normalizeHex,
  isValidHex,
  getLuminance,
  CURATED_COLOR_PALETTES,
} from '../src/components/ui/color-picker';
import type { GuardianAvatarRecord } from '../src/features/identity-avatar/types/avatar.types';

describe('Avatar Studio & 10-Digit Avatar Code Engine', () => {
  it('validates 10-digit numeric Avatar Codes accurately', () => {
    expect(validateAvatarCode('4839201746')).toBe(true);
    expect(validateAvatarCode('#4839201746')).toBe(true);
    expect(validateAvatarCode('0000000000')).toBe(true);
    expect(validateAvatarCode('9999999999')).toBe(true);

    // Invalid codes
    expect(validateAvatarCode('483920174')).toBe(false); // 9 digits
    expect(validateAvatarCode('48392017460')).toBe(false); // 11 digits
    expect(validateAvatarCode('483920174A')).toBe(false); // alpha
    expect(validateAvatarCode('')).toBe(false);
    expect(validateAvatarCode(null)).toBe(false);
  });

  it('formats and cleans avatar codes properly', () => {
    expect(cleanAvatarCode('#4839201746')).toBe('4839201746');
    expect(cleanAvatarCode(' 4839201746 ')).toBe('4839201746');
    expect(formatAvatarCode('4839201746')).toBe('#4839201746');
    expect(formatAvatarCode('#4839201746')).toBe('#4839201746');
  });

  it('generates random fallback 10-digit codes satisfying regex', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateClientAvatarCode();
      expect(code).toHaveLength(10);
      expect(validateAvatarCode(code)).toBe(true);
    }
  });

  it('formats GuardianAvatarRecord to GuardianAvatarDTO cleanly', () => {
    const config = generateAvatarConfig({
      entityId: 'proj-123',
      entityKind: 'project',
      name: 'Alpha Project',
      preferredColor: '#06b6d4',
    });

    const mockRecord: GuardianAvatarRecord = {
      id: 'avatar-uuid-1',
      avatar_code: '4839201746',
      name: 'Alpha Guardian',
      avatar_config: config,
      generator_version: 1,
      project_id: 'proj-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project: {
        id: 'proj-123',
        name: 'Alpha Project',
        slug: 'alpha-project',
        status: 'in_progress',
        color: '#06b6d4',
        client: {
          id: 'client-99',
          name: 'Stark Industries',
          company: 'Stark Ind.',
        },
      },
    };

    const dto = AvatarService.formatDTO(mockRecord);
    expect(dto.id).toBe('avatar-uuid-1');
    expect(dto.avatarCode).toBe('4839201746');
    expect(dto.name).toBe('Alpha Guardian');
    expect(dto.isAssigned).toBe(true);
    expect(dto.projectName).toBe('Alpha Project');
    expect(dto.clientName).toBe('Stark Industries');
  });

  it('preserves Avatar Code and identity bindings when regenerating candidate appearances', () => {
    const config = generateAvatarConfig({
      entityId: 'proj-123',
      entityKind: 'project',
      name: 'Titan Project',
    });

    const mockRecord: GuardianAvatarRecord = {
      id: 'avatar-uuid-2',
      avatar_code: '9876543210',
      name: 'Titan Guardian',
      avatar_config: config,
      generator_version: 1,
      project_id: 'proj-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const dto = AvatarService.formatDTO(mockRecord);
    const candidate = AvatarService.generateRegenerationCandidate(dto);

    // Candidate should produce valid BunkerAvatarConfig
    expect(candidate.version).toBe(1);
    expect(candidate.archetype).toBeDefined();
    expect(candidate.primaryColor).toBeDefined();
    expect(candidate.seed).toContain('regen-');

    // Original avatar code remains unmodified
    expect(dto.avatarCode).toBe('9876543210');
  });

  it('validates and normalizes hex colors across all curated palettes', () => {
    expect(isValidHex('#E11D48')).toBe(true);
    expect(isValidHex('#06b6d4')).toBe(true);
    expect(isValidHex('#FFF')).toBe(true);
    expect(isValidHex('not-a-color')).toBe(false);

    expect(normalizeHex('e11d48')).toBe('#E11D48');
    expect(normalizeHex('#e11d48')).toBe('#E11D48');

    // Test that all curated palettes have valid hex codes
    const categories = Object.keys(CURATED_COLOR_PALETTES);
    expect(categories).toContain('vibrant');
    expect(categories).toContain('metallic');
    expect(categories).toContain('nocturne');
    expect(categories).toContain('pastel');

    for (const cat of categories) {
      const swatches = CURATED_COLOR_PALETTES[cat];
      expect(swatches.length).toBeGreaterThan(0);
      for (const swatch of swatches) {
        expect(isValidHex(swatch.hex)).toBe(true);
        expect(getLuminance(swatch.hex)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
