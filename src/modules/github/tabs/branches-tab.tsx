import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon } from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface BranchesTabProps {
  repo: any;
  telemetry: any;
}

export const BranchesTab: React.FC<BranchesTabProps> = ({ repo }) => {
  // The GitHub API /branches endpoint isn't called by the sync function,
  // so we show the default branch from the repo record.
  const defaultBranch = repo?.branch || 'main';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <span className="font-bold text-white text-xs">Repository Branches</span>
          <span className="text-[10px] text-zinc-500 font-sans">Default Branch Tracking</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded bg-zinc-950 border border-zinc-850">
            <div className="flex items-center gap-2.5">
              <HugeiconsIcon icon={GitBranchIcon} size={15} className="text-cyan-400 shrink-0" />
              <span className="font-bold text-white text-sm">{defaultBranch}</span>
              <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] uppercase font-bold">
                Default
              </Badge>
              <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] uppercase font-bold">
                Protected
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-zinc-400 text-xs">
              <span>Last Synced: <strong className="text-cyan-400">{repo?.last_synced_at ? new Date(repo.last_synced_at).toLocaleString() : '—'}</strong></span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 font-sans pt-2">
          Branch listing requires GitHub API branch endpoint integration. Currently tracking the default branch from the repository record.
        </p>
      </div>
    </motion.div>
  );
};
