import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  GitBranchIcon,
  RefreshIcon,
  Link01Icon,
  Copy01Icon,
  Tick02Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';

interface GithubRepoHeroProps {
  repo: any;
  project?: any;
  telemetry?: any;
  onSync: () => void;
  onRefresh?: () => void;
  onDisconnect?: () => void;
  isSyncing?: boolean;
}

export const GithubRepoHero: React.FC<GithubRepoHeroProps> = ({
  repo,
  project,
  telemetry,
  onSync,
  onDisconnect,
  isSyncing = false,
}) => {
  const [copiedClone, setCopiedClone] = useState(false);

  if (!repo) return null;

  const repoName = repo.repo_url ? repo.repo_url.replace('https://github.com/', '') : 'Repository';
  const cloneUrl = `${repo.repo_url}.git`;
  const durationMs = telemetry?.durationMs;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneUrl);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 rounded-sm bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border border-zinc-800/90 shadow-xl font-mono text-xs select-none space-y-3 sm:space-y-4"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Repo Avatar & Metadata */}
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-md">
            <HugeiconsIcon icon={GithubIcon} size={20} className="text-zinc-300 sm:hidden" />
            <HugeiconsIcon icon={GithubIcon} size={24} className="text-zinc-300 hidden sm:block" />
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight break-all sm:truncate">
                {repoName}
              </h1>
              <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] uppercase font-bold shrink-0">
                {repo.visibility || 'public'}
              </Badge>
              <Badge variant="outline" className="rounded-sm bg-purple-950/80 text-purple-300 border-purple-800 text-[10px] uppercase font-bold flex items-center gap-1 shrink-0">
                <HugeiconsIcon icon={GitBranchIcon} size={11} />
                <span>{repo.branch || 'main'}</span>
              </Badge>
            </div>

            {project && (
              <p className="text-[11px] text-zinc-400 font-sans flex flex-wrap items-center gap-1.5">
                <span>Project:</span>
                <strong className="text-white font-mono">{project.name}</strong>
              </p>
            )}

            {repo.organization && (
              <p className="text-[11px] text-zinc-500 font-sans">
                Organization: <strong className="text-zinc-300 font-mono">{repo.organization}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={repo.repo_url}
            target="_blank"
            rel="noreferrer"
            className="h-8 sm:h-9 px-3 rounded-sm bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 font-bold text-[11px] sm:text-xs hover:bg-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <HugeiconsIcon icon={Link01Icon} size={13} />
            <span>Open GitHub</span>
          </a>

          <button
            onClick={handleCopyClone}
            className="h-8 sm:h-9 px-3 rounded-sm bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 font-bold text-[11px] sm:text-xs hover:bg-zinc-700 hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <HugeiconsIcon icon={copiedClone ? Tick02Icon : Copy01Icon} size={13} className={copiedClone ? 'text-emerald-400' : ''} />
            <span className="hidden sm:inline">{copiedClone ? 'Copied!' : 'Copy Clone URL'}</span>
            <span className="sm:hidden">{copiedClone ? 'Copied!' : 'Clone'}</span>
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="h-8 sm:h-9 px-3 rounded-sm bg-white text-black font-bold text-[11px] sm:text-xs hover:bg-zinc-200 cursor-pointer shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            {isSyncing ? <RadialSpinner size={13} /> : <HugeiconsIcon icon={RefreshIcon} size={13} />}
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="h-8 sm:h-9 w-8 sm:w-9 rounded-sm bg-zinc-850 border border-zinc-750 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer inline-flex items-center justify-center shrink-0 transition-colors"
              title="Disconnect Repository"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Metadata Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-sans">
        <div>
          <span>Default Branch: <strong className="text-white font-mono">{repo.branch || 'main'}</strong></span>
        </div>
        <div>
          <span>Last Synced: <strong className="text-cyan-400 font-mono">{repo.last_synced_at ? new Date(repo.last_synced_at).toLocaleTimeString() : '—'}</strong></span>
        </div>
        <div>
          <span>Latest Release: <strong className="text-emerald-400 font-mono">{repo.latest_version || repo.latest_release || '—'}</strong></span>
        </div>
        <div>
          <span>Sync Duration: <strong className="text-zinc-300 font-mono">{durationMs ? `${durationMs}ms` : '—'}</strong></span>
        </div>
      </div>
    </motion.div>
  );
};
