import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  GithubIcon,
  GitBranchIcon,
  RefreshIcon,
  AlertCircleIcon,
  PinIcon,
  Folder01Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';

interface GithubRepoSidebarProps {
  repositories: any[];
  projects: any[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onSyncRepo: (e: React.MouseEvent, projectId: string, repoUrl: string) => void;
  isSyncing?: boolean;
}

export const GithubRepoSidebar: React.FC<GithubRepoSidebarProps> = ({
  repositories,
  projects,
  selectedProjectId,
  onSelectProject,
  onSyncRepo,
  isSyncing = false,
}) => {
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const filtered = repositories.filter((r) => {
    const matchesSearch =
      r.repo_url.toLowerCase().includes(search.toLowerCase()) ||
      (r.organization && r.organization.toLowerCase().includes(search.toLowerCase()));
    const matchesVis = visibilityFilter === 'all' || r.visibility === visibilityFilter;
    const matchesPinned = !pinnedOnly || r.is_pinned;
    return matchesSearch && matchesVis && matchesPinned;
  });

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={GithubIcon} size={14} className="text-zinc-300" />
          <span>Connected Repositories</span>
        </span>
        <span className="text-[10px] text-cyan-400 font-bold">{filtered.length} / {repositories.length}</span>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="space-y-2">
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repository, organization..."
            className="w-full pl-9 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
          />
        </div>

        <div className="flex items-center justify-between gap-1.5 p-1 rounded-sm bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-1">
            {(['all', 'public', 'private'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibilityFilter(v)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  visibilityFilter === v
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`p-1 rounded cursor-pointer transition-colors ${
              pinnedOnly ? 'text-amber-400 bg-amber-950/40 border border-amber-800/60' : 'text-zinc-500 hover:text-white'
            }`}
            title="Toggle Pinned Repositories"
          >
            <HugeiconsIcon icon={PinIcon} size={13} />
          </button>
        </div>
      </div>

      {/* Repository List Cards */}
      <div className="space-y-2 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
        {filtered.length === 0 ? (
          <div className="p-6 rounded-sm bg-zinc-900 border border-zinc-800 text-center text-zinc-500 text-xs">
            No connected repositories match query.
          </div>
        ) : (
          filtered.map((repo) => {
            const projectObj = projects.find((p) => p.id === repo.project_id);
            const isSelected = selectedProjectId === repo.project_id;
            const repoName = repo.repo_url.replace('https://github.com/', '');

            return (
              <div
                key={repo.id}
                onClick={() => onSelectProject(repo.project_id)}
                className={`p-3.5 rounded-sm border cursor-pointer transition-all space-y-2.5 ${
                  isSelected
                    ? 'bg-zinc-800/90 border-zinc-600 shadow-md ring-1 ring-zinc-700'
                    : 'bg-zinc-900/90 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <HugeiconsIcon icon={GithubIcon} size={14} className={isSelected ? 'text-cyan-400' : 'text-zinc-400'} />
                      <span className="truncate max-w-[170px] text-xs sm:text-sm">{repoName}</span>
                    </div>

                    {projectObj && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <HugeiconsIcon icon={Folder01Icon} size={11} className="text-zinc-500" />
                        <span className="truncate max-w-[150px]">{projectObj.name}</span>
                      </div>
                    )}
                  </div>

                  <Badge
                    variant="outline"
                    className={`rounded-sm text-[9px] font-bold uppercase shrink-0 ${
                      repo.visibility === 'public'
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {repo.visibility}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <HugeiconsIcon icon={GitBranchIcon} size={11} className="text-purple-400" />
                      <span>{repo.branch}</span>
                    </span>

                    <span className="flex items-center gap-1 text-amber-400">
                      <HugeiconsIcon icon={AlertCircleIcon} size={11} />
                      <span>{repo.open_issues || 0}</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => onSyncRepo(e, repo.project_id, repo.repo_url)}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer font-mono"
                    title="Sync Repository Telemetry"
                  >
                    {isSyncing ? <RadialSpinner size={12} /> : <HugeiconsIcon icon={RefreshIcon} size={12} />}
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
