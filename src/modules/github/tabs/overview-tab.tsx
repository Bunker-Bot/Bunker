import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
  StarIcon,
  Clock01Icon
} from '@hugeicons/core-free-icons';

interface OverviewTabProps {
  repo: any;
  telemetry: any;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ repo, telemetry }) => {
  const commits = telemetry?.commits || [];
  const pullRequests = telemetry?.pullRequests || [];
  const contributors = telemetry?.contributors || [];
  const latestCommit = commits[0];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5 font-mono text-xs select-none">
      {/* Repository Telemetry Grid */}
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <HugeiconsIcon icon={GithubIcon} size={16} className="text-cyan-400" />
            <span>Repository Summary</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-sans">Live Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center justify-between">
              Open Issues <HugeiconsIcon icon={AlertCircleIcon} size={12} className="text-rose-400" />
            </span>
            <span className="text-lg font-bold text-white block">{repo?.open_issues || 0}</span>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center justify-between">
              Pull Requests <HugeiconsIcon icon={GitPullRequestIcon} size={12} className="text-emerald-400" />
            </span>
            <span className="text-lg font-bold text-white block">{pullRequests.length}</span>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center justify-between">
              Commits <HugeiconsIcon icon={GitCommitIcon} size={12} className="text-cyan-400" />
            </span>
            <span className="text-lg font-bold text-white block">{commits.length}</span>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center justify-between">
              Contributors <HugeiconsIcon icon={StarIcon} size={12} className="text-amber-400" />
            </span>
            <span className="text-lg font-bold text-white block">{contributors.length}</span>
          </div>
        </div>
      </div>

      {/* Latest Commit Card */}
      {latestCommit ? (
        <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <HugeiconsIcon icon={GitCommitIcon} size={14} className="text-emerald-400" />
              <span>Latest Commit</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-cyan-400 font-mono">
              {latestCommit.shortSha || latestCommit.sha?.substring(0, 7)}
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-white break-words">{latestCommit.message}</h4>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-zinc-400 font-sans">
              {latestCommit.avatar && (
                <img src={latestCommit.avatar} alt="" className="w-5 h-5 rounded-full border border-zinc-700" />
              )}
              <span>Author: <strong className="text-zinc-200 font-mono">{latestCommit.author}</strong></span>
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Clock01Icon} size={12} className="text-zinc-500" />
                {latestCommit.date ? new Date(latestCommit.date).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-sm bg-zinc-900 border border-zinc-800 text-center text-zinc-500 text-xs">
          Sync repository to load commit history.
        </div>
      )}
    </motion.div>
  );
};
