import type {
  AvatarArchetype,
  AvatarIdentityInput,
  AvatarPose,
  BunkerAvatarConfig,
} from '../types/avatar.types';
import { SeededPRNG, createDeterministicSeed } from './avatar-seed';
import { BUNKER_PALETTES, customizePaletteWithColor } from './avatar-palette';

export const AVATAR_GENERATOR_VERSION = 1;

const ARCHETYPES: readonly AvatarArchetype[] = ['guardian', 'architect', 'sentinel', 'operator'];
const POSES: readonly AvatarPose[] = ['three-quarter-left', 'three-quarter-right'];

/**
 * Generates a stable, versioned BunkerAvatarConfig deterministically.
 */
export function generateAvatarConfig(input: AvatarIdentityInput): BunkerAvatarConfig {
  const {
    entityId,
    entityKind,
    name,
    preferredColor,
    parentEntityId,
    salt,
  } = input;

  // 1. Build composite deterministic seed string
  const rawSeed = createDeterministicSeed([
    `v${AVATAR_GENERATOR_VERSION}`,
    entityKind,
    parentEntityId || '',
    entityId,
    name,
    salt || '',
  ]);

  const prng = new SeededPRNG(rawSeed);

  // 2. Select Archetype
  let archetype = prng.pick(ARCHETYPES);
  if (entityKind === 'team') {
    // Team Guardians communicate coordination, stability and leadership
    archetype = prng.nextFloat() > 0.4 ? 'guardian' : 'architect';
  } else if (entityKind === 'client') {
    // Clients lean towards stately guardian & architect archetypes
    archetype = prng.nextFloat() > 0.5 ? 'guardian' : 'architect';
  } else if (entityKind === 'project') {
    // Projects vary across all archetypes
    archetype = prng.pick(ARCHETYPES);
  }

  // 3. Variant Indices
  const headVariant = prng.nextInt(0, 3);
  const visorVariant = prng.nextInt(0, 3);
  const shoulderVariant = prng.nextInt(0, 2);
  const plinthVariant = prng.nextInt(0, 2);
  const emblemVariant = prng.nextInt(0, 3);
  const environmentVariant = prng.nextInt(0, 2);

  // 4. Pose (Art-directed default is 15-20° three-quarter view)
  const pose: AvatarPose = prng.pick(POSES);

  // 5. Palette Selection
  const basePalette = prng.pick(BUNKER_PALETTES);
  const palette = customizePaletteWithColor(basePalette, preferredColor);

  return {
    version: AVATAR_GENERATOR_VERSION,
    seed: rawSeed,
    archetype,
    headVariant,
    visorVariant,
    shoulderVariant,
    plinthVariant,
    material: basePalette.material,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    visorTint: palette.visor,
    glowColor: palette.glow,
    emblemVariant,
    pose,
    environmentVariant,
    metalness: palette.metalness,
    roughness: palette.roughness,
  };
}

/**
 * Generates N alternative deterministic candidate variations from a base configuration seed.
 */
export function generateCandidateVariants(
  baseConfig: BunkerAvatarConfig,
  count: number = 4
): BunkerAvatarConfig[] {
  const variants: BunkerAvatarConfig[] = [];
  for (let i = 1; i <= count; i++) {
    const variantConfig = generateAvatarConfig({
      entityId: `${baseConfig.seed}-var-${i}`,
      entityKind: 'generic',
      name: `Variant ${i}`,
      salt: `variant-salt-${i * 1337}`,
    });
    variants.push(variantConfig);
  }
  return variants;
}
