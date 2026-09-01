import { describe, it, expect } from 'vitest';
import { STAGE_DEFINITIONS, type PortalEntryStage } from '../src/modules/portal/entry/portal-entry.types';
import { generateAvatarConfig } from '../src/features/identity-avatar/lib/avatar-generator';

describe('Bunker Guardian Secure Portal Entry Engine', () => {
  it('should enforce weighted stages where 100% is only rendered at ready or terminal states', () => {
    const activeLoadingStages: PortalEntryStage[] = [
      'initializing',
      'validating-link',
      'resolving-access',
      'loading-identity',
      'loading-project',
      'checking-portal-state',
      'preparing-assets',
    ];

    activeLoadingStages.forEach((stage) => {
      const def = STAGE_DEFINITIONS[stage];
      expect(def.weight).toBeLessThan(100);
      expect(def.weight).toBeGreaterThan(0);
      expect(def.label).toBeDefined();
    });

    expect(STAGE_DEFINITIONS.ready.weight).toBe(100);
    expect(STAGE_DEFINITIONS.ready.mood).toBe('ready');
  });

  it('should map progressive stages to precise Guardian presentation moods without altering stored identity', () => {
    expect(STAGE_DEFINITIONS.initializing.mood).toBe('dormant');
    expect(STAGE_DEFINITIONS['validating-link'].mood).toBe('awakening');
    expect(STAGE_DEFINITIONS['resolving-access'].mood).toBe('awakening');
    expect(STAGE_DEFINITIONS['loading-identity'].mood).toBe('checking');
    expect(STAGE_DEFINITIONS['loading-project'].mood).toBe('focused');
    expect(STAGE_DEFINITIONS['checking-portal-state'].mood).toBe('focused');
    expect(STAGE_DEFINITIONS['preparing-assets'].mood).toBe('ready');
    expect(STAGE_DEFINITIONS.ready.mood).toBe('ready');
    expect(STAGE_DEFINITIONS['password-required'].mood).toBe('checking');
    expect(STAGE_DEFINITIONS['access-restricted'].mood).toBe('attention');
    expect(STAGE_DEFINITIONS.error.mood).toBe('attention');
    expect(STAGE_DEFINITIONS.expired.mood).toBe('unavailable');
    expect(STAGE_DEFINITIONS.revoked.mood).toBe('unavailable');
    expect(STAGE_DEFINITIONS.invalid.mood).toBe('unavailable');
  });

  it('should preserve full Guardian physical customization during entry experience', () => {
    const customConfig = generateAvatarConfig({
      entityId: 'proj-acme-portal',
      entityKind: 'project',
      name: 'Acme Commerce Platform',
      preferredColor: '#8B5CF6',
    });

    expect(customConfig.primaryColor).toBeDefined();
    expect(customConfig.headVariant).toBeDefined();
    expect(customConfig.visorVariant).toBeDefined();
    expect(customConfig.shoulderVariant).toBeDefined();
    expect(customConfig.glowColor).toBeDefined();
  });

  it('should maintain truthful, non-theatrical copy across all stages', () => {
    Object.values(STAGE_DEFINITIONS).forEach((def) => {
      // Must not contain fake cyberpunk/hacking keywords
      expect(def.label.toLowerCase()).not.toContain('quantum');
      expect(def.label.toLowerCase()).not.toContain('decrypting');
      expect(def.label.toLowerCase()).not.toContain('matrix');
      expect(def.label.toLowerCase()).not.toContain('neural');
    });
  });
});
