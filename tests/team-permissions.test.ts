import { describe, it, expect } from 'vitest';
import {
  hasTeamCapability,
  canManageMembers,
  canViewFinance,
  canManageFinance,
  canManageTeamIdentity,
} from '../src/modules/teams/permissions/team.permissions';

describe('Team Capability & Role Matrix', () => {
  it('grants full administrative and financial permissions to Owner', () => {
    expect(hasTeamCapability('owner', 'team.manage')).toBe(true);
    expect(hasTeamCapability('owner', 'team.delete')).toBe(true);
    expect(hasTeamCapability('owner', 'team.members.manage')).toBe(true);
    expect(hasTeamCapability('owner', 'team.finance.view')).toBe(true);
    expect(hasTeamCapability('owner', 'team.finance.manage')).toBe(true);
    expect(canManageMembers('owner')).toBe(true);
    expect(canViewFinance('owner')).toBe(true);
    expect(canManageFinance('owner')).toBe(true);
  });

  it('grants management permissions to Admin except permanent team deletion', () => {
    expect(hasTeamCapability('admin', 'team.manage')).toBe(true);
    expect(hasTeamCapability('admin', 'team.delete')).toBe(false);
    expect(hasTeamCapability('admin', 'team.members.manage')).toBe(true);
    expect(hasTeamCapability('admin', 'team.finance.view')).toBe(true);
  });

  it('permits Project Manager to manage projects and deliverables with financial visibility', () => {
    expect(hasTeamCapability('project_manager', 'project.create')).toBe(true);
    expect(hasTeamCapability('project_manager', 'project.manage')).toBe(true);
    expect(hasTeamCapability('project_manager', 'team.finance.view')).toBe(true);
    expect(hasTeamCapability('project_manager', 'team.members.manage')).toBe(false);
  });

  it('restricts Contributor from financial totals and team management', () => {
    expect(hasTeamCapability('contributor', 'team.finance.view')).toBe(false);
    expect(hasTeamCapability('contributor', 'team.members.manage')).toBe(false);
    expect(hasTeamCapability('contributor', 'time.track')).toBe(true);
    expect(hasTeamCapability('contributor', 'documents.write')).toBe(true);
    expect(canViewFinance('contributor')).toBe(false);
  });

  it('restricts Viewer to read-only access with zero write or financial access', () => {
    expect(hasTeamCapability('viewer', 'team.manage')).toBe(false);
    expect(hasTeamCapability('viewer', 'team.finance.view')).toBe(false);
    expect(hasTeamCapability('viewer', 'project.create')).toBe(false);
    expect(hasTeamCapability('viewer', 'time.track')).toBe(false);
  });
});
