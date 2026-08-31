/**
 * Deterministic PRNG and Seed Generation Engine for Bunker Guardian Avatars
 */

// 32-bit FNV-1a Hash
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export class SeededPRNG {
  private state: number;

  constructor(seedInput: string | number) {
    if (typeof seedInput === 'number') {
      this.state = seedInput >>> 0;
    } else {
      this.state = fnv1a32(seedInput);
    }
    if (this.state === 0) this.state = 0x6d2b79f5;
  }

  /**
   * Generates next 32-bit integer in sequence (LCG / Mulberry32)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0);
  }

  /**
   * Generates a float in range [0, 1)
   */
  nextFloat(): number {
    return this.next() / 4294967296;
  }

  /**
   * Generates an integer in range [min, max] inclusive
   */
  nextInt(min: number, max: number): number {
    if (min >= max) return min;
    return min + Math.floor(this.nextFloat() * (max - min + 1));
  }

  /**
   * Picks an element from an array deterministically
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }
}

export function createDeterministicSeed(components: Array<string | number | undefined | null>): string {
  const normalized = components
    .filter((c) => c !== undefined && c !== null)
    .map((c) => String(c).trim().toLowerCase())
    .join('::');
  return normalized;
}
