import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Task01Icon,
  Search01Icon,
  CheckmarkCircle02Icon,
  LockKeyIcon,
} from '@hugeicons/core-free-icons';
import { useTeamProjects } from '../../../../lib/supabase/queries/teams';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../../components/ui/select';
import type { Team } from '../../types/team.types';

interface TeamDeliverablesViewProps {
  team: Team;
}

export const TeamDeliverablesView: React.FC<TeamDeliverablesViewProps> = ({ team }) => {
  const navigate = useNavigate();
  const { data: teamProjects = [], isLoading } = useTeamProjects(team.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Collect all deliverables from team projects
  const deliverables = teamProjects.flatMap((p: any) =>
    (p.deliverables || []).map((d: any) => ({
      ...d,
      project: { id: p.id, name: p.name, slug: p.slug },
    }))
  );

  const filteredDeliverables = deliverables.filter((d: any) => {
    if (selectedProjectId !== 'all' && d.project.id !== selectedProjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.project?.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deliverables..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <Select value={selectedProjectId} onValueChange={(val: any) => setSelectedProjectId(val)}>
            <SelectTrigger size="sm" className="w-48 bg-zinc-900 border-zinc-800 rounded-sm text-xs text-zinc-100">
              <SelectValue>
                {selectedProjectId === 'all'
                  ? 'All Projects'
                  : teamProjects.find((p: any) => p.id === selectedProjectId)?.name || selectedProjectId}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 rounded-sm text-zinc-200">
              <SelectItem value="all">All Projects</SelectItem>
              {teamProjects.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-sm overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading deliverables...</div>
        ) : filteredDeliverables.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <HugeiconsIcon icon={Task01Icon} size={32} className="text-zinc-600 mx-auto" />
            <p>No deliverables recorded across team projects yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {filteredDeliverables.map((deliv: any) => (
              <div
                key={deliv.id}
                onClick={() => navigate(`/app/projects/${deliv.project.slug}`)}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <HugeiconsIcon icon={Task01Icon} size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 hover:text-cyan-400 transition-colors">
                      {deliv.title || 'Deliverable Asset'}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      <span className="text-cyan-400">{deliv.project.name}</span>
                      <span>•</span>
                      <span>{deliv.asset_type || 'File'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {deliv.is_manual_unlocked ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-sm">
                      <HugeiconsIcon icon={LockKeyIcon} size={12} /> Locked on Settlement
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
