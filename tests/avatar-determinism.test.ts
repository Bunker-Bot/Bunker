import { describe, it, expect } from 'vitest';
import { generateAvatarConfig, AVATAR_GENERATOR_VERSION } from '../src/features/identity-avatar/lib/avatar-generator';
import { fnv1a32, SeededPRNG } from '../src/features/identity-avatar/lib/avatar-seed';

describe('Bunker Guardian Avatar Determinism Engine', () => {
  it('should generate deeply identical configurations for the same entity input', () => {
    const input = {
      entityId: 'proj-7f8a9b0c-1122-3344-5566-778899aabbcc',
      entityKind: 'project' as const,
      name: 'Acme High-Speed Commerce Engine',
      preferredColor: '#06B6D4',
    };

    const config1 = generateAvatarConfig(input);
    const config2 = generateAvatarConfig(input);

    expect(config1).toEqual(config2);
    expect(config1.version).toBe(AVATAR_GENERATOR_VERSION);
    expect(config1.seed).toBe(config2.seed);
    expect(config1.headVariant).toBe(config2.headVariant);
    expect(config1.visorVariant).toBe(config2.visorVariant);
    expect(config1.shoulderVariant).toBe(config2.shoulderVariant);
    expect(config1.accentColor).toBe('#06B6D4');
  });

  it('should produce distinct configurations for different entity IDs', () => {
    const configA = generateAvatarConfig({
      entityId: 'client-1111-2222-3333-4444',
      entityKind: 'client',
      name: 'Alpha Corporation',
    });

    const configB = generateAvatarConfig({
      entityId: 'client-9999-8888-7777-6666',
      entityKind: 'client',
      name: 'Omega Syndicate',
    });

    expect(configA.seed).not.toBe(configB.seed);
  });

  it('should generate stable PRNG sequences across multiple calls', () => {
    const prng1 = new SeededPRNG('bunker-test-seed');
    const prng2 = new SeededPRNG('bunker-test-seed');

    const seq1 = [prng1.nextFloat(), prng1.nextInt(0, 10), prng1.nextFloat()];
    const seq2 = [prng2.nextFloat(), prng2.nextInt(0, 10), prng2.nextFloat()];

    expect(seq1).toEqual(seq2);
  });
});
