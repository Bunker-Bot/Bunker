import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  FolderCheckIcon,
  Task01Icon,
  FileCodeIcon,
  Clock01Icon,
  Coins01Icon,
  GitBranchIcon,
  Activity01Icon,
  Shield02Icon,
  Settings01Icon,
  SparklesIcon,
  ArrowDown01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { useTeam, useTeamOverview, useTeams } from '../../../lib/supabase/queries/teams';
import { IdentityAvatarCanvas } from '../../../features/identity-avatar/components/IdentityAvatarCanvas';
import { generateAvatarConfig } from '../../../features/identity-avatar/lib/avatar-generator';
import { TeamOverviewView } from './views/TeamOverviewView';
import { TeamProjectsView } from './views/TeamProjectsView';
import { TeamClientsView } from './views/TeamClientsView';
import { TeamMembersView } from './views/TeamMembersView';
import { TeamDeliverablesView } from './views/TeamDeliverablesView';
import { TeamDocumentsView } from './views/TeamDocumentsView';
import { TeamTimeView } from './views/TeamTimeView';
import { TeamFinanceView } from './views/TeamFinanceView';
import { TeamGithubView } from './views/TeamGithubView';
import { TeamActivityView } from './views/TeamActivityView';
import { TeamIdentityView } from './views/TeamIdentityView';
import { TeamSettingsView } from './views/TeamSettingsView';
import type { TeamRole } from '../types/team.types';

const NAV_GROUPS = [
  {
    group: 'Overview',
    items: [
      { id: 'overview', label: 'Overview', icon: Shield02Icon },
      { id: 'activity', label: 'Activity', icon: Activity01Icon },
    ],
  },
  {
    group: 'Work',
    items: [
      { id: 'projects', label: 'Projects', icon: FolderCheckIcon },
      { id: 'deliverables', label: 'Deliverables', icon: Task01Icon },
      { id: 'documents', label: 'Documents', icon: FileCodeIcon },
    ],
  },
  {
    group: 'People',
    items: [
      { id: 'members', label: 'Members', icon: UserGroupIcon },
      { id: 'clients', label: 'Clients', icon: UserGroupIcon },
    ],
  },
  {
    group: 'Operations',
    items: [
      { id: 'time', label: 'Time', icon: Clock01Icon },
      { id: 'finance', label: 'Finance', icon: Coins01Icon },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { id: 'github', label: 'GitHub', icon: GitBranchIcon },
    ],
  },
  {
    group: 'Team',
    items: [
      { id: 'identity', label: 'Identity', icon: SparklesIcon },
      { id: 'settings', label: 'Settings', icon: Settings01Icon },
    ],
  },
];

export const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const { data: team, isLoading: isTeamLoading } = useTeam(teamId);
  const { data: overview, isLoading: isOverviewLoading } = useTeamOverview(teamId);
  const { data: allTeams = [] } = useTeams();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const avatarConfig = useMemo(() => {
    if (!team) return null;
    return (
      team.avatarConfig ||
      generateAvatarConfig({
        entityId: team.slug,
        entityKind: 'team',
        name: team.name,
        preferredColor: team.primaryColor || '#06B6D4',
      })
    );
  }, [team]);

  if (isTeamLoading || isOverviewLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono text-xs text-zinc-500">
        <HugeiconsIcon icon={Loading03Icon} size={24} className="animate-spin text-cyan-400 mb-2" />
        Loading team workspace...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-16 text-center font-mono space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">Team Workspace Not Found</h2>
        <p className="text-xs text-zinc-500">The requested team does not exist or you do not have permission.</p>
        <button
          onClick={() => navigate('/app/teams')}
          className="px-4 py-2 bg-zinc-800 text-xs text-zinc-200 rounded-sm hover:bg-zinc-700"
        >
          Return to Teams Directory
        </button>
      </div>
    );
  }

  const userRole: TeamRole = overview?.userRole || 'viewer';

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-mono p-4 sm:p-6 lg:p-10 space-y-6">
      {/* 1. Header Banner & Team Hero */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Team Guardian Preview */}
            <div
              onClick={() => setActiveTab('identity')}
              title="View Team Guardian Identity"
              className="w-16 h-16 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer overflow-hidden flex items-center justify-center relative flex-shrink-0 transition-colors shadow-lg"
            >
              {avatarConfig && (
                <IdentityAvatarCanvas config={avatarConfig} />
              )}
            </div>

            {/* Team Info & Switcher */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                  className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white hover:text-cyan-400 transition-colors"
                >
                  <span>{team.name}</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="text-zinc-500" />
                </button>

                {/* Team Switcher Menu */}
                {isSwitcherOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-sm p-2 shadow-2xl z-30 space-y-1">
                    <div className="text-[10px] text-zinc-500 px-2 py-1 uppercase tracking-wider">
                      Switch Team
                    </div>
                    {allTeams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setIsSwitcherOpen(false);
                          navigate(`/app/teams/${t.id}`);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors ${
                          t.id === team.id
                            ? 'bg-zinc-800 text-cyan-400 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span className="text-[10px] text-zinc-500">{t.teamType}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-300 rounded-sm">
                  {team.teamType}
                </span>
                {team.avatarCode && (
                  <span className="text-zinc-500 text-[10px]">
                    Guardian #{team.avatarCode}
                  </span>
                )}
                <span>•</span>
                <span className="text-zinc-500 capitalize">{userRole.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/app/avatar-studio/team/${team.id}`)}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-sm transition-colors"
            >
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-cyan-400" />
              Customize Guardian
            </button>
          </div>
        </div>

        {/* 2. Secondary Grouped Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-zinc-800/80 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="flex items-center gap-1 pr-3 border-r border-zinc-800/60 last:border-0">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <HugeiconsIcon icon={item.icon} size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tab Content View Switcher */}
      <div className="pt-2">
        {activeTab === 'overview' && overview && (
          <TeamOverviewView overview={overview} userRole={userRole} onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'projects' && <TeamProjectsView team={team} />}
        {activeTab === 'clients' && <TeamClientsView team={team} />}
        {activeTab === 'members' && <TeamMembersView team={team} userRole={userRole} />}
        {activeTab === 'deliverables' && <TeamDeliverablesView team={team} />}
        {activeTab === 'documents' && <TeamDocumentsView team={team} />}
        {activeTab === 'time' && <TeamTimeView team={team} />}
        {activeTab === 'finance' && <TeamFinanceView team={team} userRole={userRole} />}
        {activeTab === 'github' && <TeamGithubView team={team} />}
        {activeTab === 'activity' && <TeamActivityView team={team} />}
        {activeTab === 'identity' && <TeamIdentityView team={team} />}
        {activeTab === 'settings' && <TeamSettingsView team={team} userRole={userRole} />}
      </div>
    </div>
  );
};

export default TeamDetailPage;
