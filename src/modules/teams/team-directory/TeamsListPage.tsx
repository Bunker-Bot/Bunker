import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  Search01Icon,
  PlusSignIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { useTeams } from '../../../lib/supabase/queries/teams';
import { AvatarPoster } from '../../../features/identity-avatar';
import { generateAvatarConfig } from '../../../features/identity-avatar/lib/avatar-generator';
import { CreateTeamModal } from '../components/CreateTeamModal';
import type { Team } from '../types/team.types';

type TabFilter = 'all' | 'my' | 'owned' | 'archived';

export const TeamsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: teams = [], isLoading } = useTeams();

  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Status filter
      if (tabFilter === 'archived' && team.status !== 'archived') return false;
      if (tabFilter !== 'archived' && team.status === 'archived') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(query);
        const matchesType = team.teamType.toLowerCase().includes(query);
        const matchesDesc = team.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesDesc) return false;
      }

      return true;
    });
  }, [teams, tabFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-mono p-6 lg:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs uppercase tracking-wider mb-1 font-semibold">
            <HugeiconsIcon icon={UserGroupIcon} size={16} />
            Collaborative Workspaces
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teams Directory</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize multi-user collaboration, project portfolios, financial exposures, and Team Guardians
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black text-xs font-semibold rounded-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          Create Team
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-sm">
          {(['all', 'my', 'owned', 'archived'] as TabFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabFilter(tab)}
              className={`px-3 py-1.5 text-xs rounded-sm transition-colors capitalize ${
                tabFilter === tab
                  ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab === 'all' ? 'All Teams' : tab === 'my' ? 'My Teams' : tab === 'owned' ? 'Owned by Me' : 'Archived'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams by name, type..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Teams */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-zinc-900/40 border border-zinc-800/60 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-zinc-800 rounded-sm bg-zinc-950/40">
          <div className="w-12 h-12 rounded-sm bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">No teams found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Create a team workspace to begin collaborating across projects, deliverables, and team identities.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-sm transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} onSelect={() => navigate(`/app/teams/${team.id}`)} />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(id) => navigate(`/app/teams/${id}`)}
      />
    </div>
  );
};

interface TeamCardProps {
  team: Team;
  onSelect: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onSelect }) => {
  const avatarConfig = useMemo(() => {
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

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={onSelect}
      className="group relative flex flex-col justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-sm cursor-pointer transition-all shadow-lg hover:shadow-cyan-950/20 overflow-hidden font-mono"
    >
      {/* Top Banner & Guardian */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Team Guardian Poster */}
            <div className="w-12 h-12 rounded-sm bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center relative flex-shrink-0 group-hover:border-cyan-500/50 transition-colors shadow-md">
              <AvatarPoster
                config={avatarConfig}
                size="100%"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {team.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-400 rounded-sm">
                  {team.teamType}
                </span>
                {team.avatarCode && (
                  <span className="text-[10px] text-zinc-500">
                    #{team.avatarCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-1.5 rounded-sm bg-zinc-800/60 text-zinc-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-4">
          {team.description || 'Collaborative operating workspace for projects, deliverables, and team identities.'}
        </p>
      </div>

      {/* Metrics Strip */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-zinc-950/60 border border-zinc-850 rounded-sm">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Members</div>
            <div className="text-xs font-bold text-zinc-200 mt-0.5">{team.membersCount || 1}</div>
          </div>
          <div className="p-2 bg-zinc-950/60 border border-zinc-850 rounded-sm">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Clients</div>
            <div className="text-xs font-bold text-zinc-200 mt-0.5">{team.clientsCount || 0}</div>
          </div>
          <div className="p-2 bg-zinc-950/60 border border-zinc-850 rounded-sm">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Projects</div>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">{team.projectsCount || 0}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
