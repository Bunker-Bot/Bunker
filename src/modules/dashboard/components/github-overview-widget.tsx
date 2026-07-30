import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon, RefreshIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useGithubSummary } from '../../../lib/supabase/queries/dashboard';

export const GithubOverviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data: githubData, isLoading, refetch, isFetching } = useGithubSummary();

  if (isLoading) {
    return <div className="h-52 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const g = githubData || {
    totalRepos: 1,
    openPrs: 0,
    openIssues: 0,
    repos: [],
  };

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={GithubIcon} size={16} className="text-white" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">GitHub Repository Overview</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors"
            title="Manual Sync"
          >
            <HugeiconsIcon icon={RefreshIcon} size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => navigate('/app/github')}
            className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Telemetry</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Connected Repos</span>
          <p className="font-bold text-white text-sm">{g.totalRepos}</p>
        </div>
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Open PRs</span>
          <p className="font-bold text-cyan-400 text-sm">{g.openPrs}</p>
        </div>
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Open Issues</span>
          <p className="font-bold text-amber-400 text-sm">{g.openIssues}</p>
        </div>
      </div>
    </div>
  );
};
