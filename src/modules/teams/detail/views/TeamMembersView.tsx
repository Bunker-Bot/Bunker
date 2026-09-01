import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  PlusSignIcon,
  Mail01Icon,
  Delete02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import {
  useTeamMembers,
  useInviteTeamMember,
  useUpdateMemberRole,
  useRemoveTeamMember,
} from '../../../../lib/supabase/queries/teams';
import { canManageMembers } from '../../permissions/team.permissions';
import type { Team, TeamRole } from '../../types/team.types';

interface TeamMembersViewProps {
  team: Team;
  userRole: TeamRole;
}

const ROLES: { value: TeamRole; label: string; desc: string }[] = [
  { value: 'admin', label: 'Admin', desc: 'Can manage members, projects, clients, and settings' },
  { value: 'project_manager', label: 'Project Manager', desc: 'Can manage deliverables, time, and team projects' },
  { value: 'finance_manager', label: 'Finance Manager', desc: 'Can access and manage financial ledger & invoices' },
  { value: 'contributor', label: 'Contributor', desc: 'Can track time, upload docs, and update tasks' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access to permitted team workspaces' },
];

export const TeamMembersView: React.FC<TeamMembersViewProps> = ({ team, userRole }) => {
  const { data: members = [], isLoading } = useTeamMembers(team.id);
  const inviteMutation = useInviteTeamMember();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveTeamMember();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('contributor');
  const [error, setError] = useState<string | null>(null);

  const canEdit = canManageMembers(userRole);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setError(null);
    try {
      await inviteMutation.mutateAsync({
        teamId: team.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to send invitation');
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: TeamRole) => {
    await updateRoleMutation.mutateAsync({
      teamId: team.id,
      membershipId,
      role: newRole,
    });
  };

  const handleRemove = async (membershipId: string, memberName: string) => {
    if (!window.confirm(`Remove ${memberName} from this team?`)) return;
    await removeMemberMutation.mutateAsync({
      teamId: team.id,
      membershipId,
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <HugeiconsIcon icon={UserGroupIcon} size={16} className="text-purple-400" />
            Team Members Roster ({members.length})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage authenticated teammates, role capabilities, and workspace access
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading roster...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No members found.</div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {members.map((member) => {
              const displayName = member.user?.fullName || member.user?.email || 'Team Member';
              const email = member.user?.email || '—';
              const isOwner = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200">{displayName}</span>
                        {isOwner && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">{email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Dropdown */}
                    {canEdit && !isOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-lg capitalize">
                        {member.role.replace('_', ' ')}
                      </span>
                    )}

                    {/* Remove button */}
                    {canEdit && !isOwner && (
                      <button
                        onClick={() => handleRemove(member.id, displayName)}
                        title="Remove member"
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleInvite}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <HugeiconsIcon icon={Mail01Icon} size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Invite Team Member</h3>
                <p className="text-xs text-zinc-400">Send an invitation to join {team.name}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                Email Address *
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                Role Capability
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                {inviteMutation.isPending ? <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" /> : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
