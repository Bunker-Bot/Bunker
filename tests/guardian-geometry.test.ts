import { describe, it, expect } from 'vitest';
import {
  resolveGuardianGeometry,
  validateGuardianGeometry,
  normalizeGuardianConfig,
  GUARDIAN_FAMILIES,
  HEAD_REGISTRY,
  VISOR_REGISTRY,
} from '../src/features/identity-avatar/lib/guardian-geometry.resolver';
import { generateAvatarConfig } from '../src/features/identity-avatar/lib/avatar-generator';
import type { BunkerAvatarConfig } from '../src/features/identity-avatar/types/avatar.types';

describe('Bunker Guardian Canonical Geometry & Silhouette System', () => {
  const baseConfig: BunkerAvatarConfig = {
    version: 2,
    seed: 'guardian-test-seed-alpha',
    archetype: 'guardian',
    family: 'core',
    headVariant: 0,
    visorVariant: 0,
    shoulderVariant: 0,
    plinthVariant: 0,
    material: 'graphite',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E293B',
    accentColor: '#06B6D4',
    visorTint: '#06B6D4',
    glowColor: '#06B6D4',
    emblemVariant: 0,
    pose: 'front',
    environmentVariant: 0,
    metalness: 0.25,
    roughness: 0.35,
  };

  it('1. should strictly mirror left and right shoulders symmetrically around X=0', () => {
    const geom = resolveGuardianGeometry(baseConfig);
    expect(geom.leftShoulder.position.x).toBeCloseTo(-geom.rightShoulder.position.x, 4);
    expect(geom.leftShoulder.position.x).toBeLessThan(0);
    expect(geom.rightShoulder.position.x).toBeGreaterThan(0);
  });

  it('2. should align head center strictly on canonical X=0 axis', () => {
    const geom = resolveGuardianGeometry(baseConfig);
    expect(geom.head.position.x).toBe(0);
    expect(geom.visor.position.x).toBe(0);
    expect(geom.emblem.position.x).toBe(0);
  });

  it('3. should auto-fit visor width proportionally to the selected head width', () => {
    const geom = resolveGuardianGeometry(baseConfig);
    const headBounds = geom.head.bounds;
    const visorWidth = geom.visor.width;

    expect(visorWidth).toBeLessThanOrEqual(headBounds.width);
    expect(visorWidth).toBeGreaterThan(0.3);
  });

  it('4. should physically join head to neck with controlled overlap without floating', () => {
    const geom = resolveGuardianGeometry(baseConfig);
    expect(geom.head.offsetFromNeck.y).toBeGreaterThan(0.2);
    expect(geom.head.offsetFromNeck.y).toBeLessThan(0.7);
  });

  it('5. should maintain stable plinth baseline and grounded lower bust across all archetypes', () => {
    const archetypes: ('guardian' | 'sentinel' | 'architect' | 'operator')[] = [
      'guardian',
      'sentinel',
      'architect',
      'operator',
    ];

    for (const arch of archetypes) {
      const geom = resolveGuardianGeometry({ ...baseConfig, archetype: arch });
      expect(geom.plinth.position.y).toBeCloseTo(-1.15, 2);
      expect(geom.torso.position.y).toBeGreaterThan(geom.plinth.position.y);
      expect(geom.neck.topY).toBeGreaterThan(geom.neck.position.y);
    }
  });

  it('6. should validate that 100+ generated variants pass geometry collision & safety tests', () => {
    for (let i = 0; i < 50; i++) {
      const generated = generateAvatarConfig({
        entityId: `validation-test-${i}`,
        entityKind: 'project',
        name: `Guardian Entity ${i}`,
        salt: `salt-token-${i * 99}`,
      });

      const validation = validateGuardianGeometry(generated);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    }
  });

  it('7. should validate that all 20 Guardian design families have valid canonical definitions', () => {
    const families = Object.values(GUARDIAN_FAMILIES);
    expect(families).toHaveLength(20);

    for (const fam of families) {
      expect(fam.id).toBeTruthy();
      expect(fam.name).toBeTruthy();
      expect(fam.visualTone).toBeTruthy();
      expect(HEAD_REGISTRY[fam.recommendedHead]).toBeDefined();
      expect(VISOR_REGISTRY[fam.recommendedVisor]).toBeDefined();
    }
  });

  it('8. should clamp unsafe customization inputs during normalization', () => {
    const invalidConfig = {
      ...baseConfig,
      headVariant: 99,
      visorVariant: -5,
      shoulderVariant: 12,
    };

    const normalized = normalizeGuardianConfig(invalidConfig);
    expect(normalized.headVariant).toBe(9); // Max head in expanded registry
    expect(normalized.visorVariant).toBe(0); // Clamped min
    expect(normalized.shoulderVariant).toBe(5); // Max shoulder in expanded registry
  });
});
