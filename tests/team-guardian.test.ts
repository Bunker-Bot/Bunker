import { describe, it, expect } from 'vitest';
import { generateAvatarConfig } from '../src/features/identity-avatar/lib/avatar-generator';

describe('Team Guardian & Avatar Generation', () => {
  it('deterministically generates a Team Guardian config', () => {
    const config1 = generateAvatarConfig({
      entityId: 'platform-engineering',
      entityKind: 'team',
      name: 'Platform Engineering',
      preferredColor: '#06B6D4',
    });

    const config2 = generateAvatarConfig({
      entityId: 'platform-engineering',
      entityKind: 'team',
      name: 'Platform Engineering',
      preferredColor: '#06B6D4',
    });

    expect(config1.seed).toBe(config2.seed);
    expect(config1.archetype).toBe(config2.archetype);
    expect(config1.primaryColor).toBe(config2.primaryColor);
    expect(['guardian', 'architect']).toContain(config1.archetype);
  });

  it('supports inheriting Team style for project while creating a distinct project seed', () => {
    const teamConfig = generateAvatarConfig({
      entityId: 'platform-engineering',
      entityKind: 'team',
      name: 'Platform Engineering',
      preferredColor: '#06B6D4',
    });

    const projectConfig = generateAvatarConfig({
      entityId: 'commerce-core',
      entityKind: 'project',
      name: 'Commerce Core',
      preferredColor: teamConfig.primaryColor,
      parentEntityId: 'platform-engineering',
    });

    expect(projectConfig.seed).not.toBe(teamConfig.seed);
    expect(projectConfig.primaryColor).toBe(teamConfig.primaryColor);
  });
});
