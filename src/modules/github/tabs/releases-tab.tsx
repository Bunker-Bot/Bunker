import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tag01Icon, Link01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface ReleasesTabProps {
  repo: any;
  telemetry: any;
}

export const ReleasesTab: React.FC<ReleasesTabProps> = ({ repo }) => {
  const version = repo?.latest_version || repo?.latest_release;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <HugeiconsIcon icon={Tag01Icon} size={16} className="text-emerald-400" />
            <span>Releases</span>
          </div>
        </div>

        {version ? (
          <div className="p-4 rounded bg-zinc-950 border border-zinc-850 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">{version}</span>
                <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] uppercase font-bold">
                  Latest
                </Badge>
              </div>
              <span className="text-[10px] text-zinc-500 font-sans">
                Last synced: {repo?.last_synced_at ? new Date(repo.last_synced_at).toLocaleString() : '—'}
              </span>
            </div>

            {repo?.repo_url && (
              <a
                href={`${repo.repo_url}/releases`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold transition-colors text-xs"
              >
                <HugeiconsIcon icon={Link01Icon} size={13} />
                <span>View All Releases on GitHub</span>
              </a>
            )}
          </div>
        ) : (
          <div className="p-6 rounded bg-zinc-950 border border-zinc-850 text-center text-zinc-500 text-xs">
            No releases published yet. Sync repository to fetch release data.
          </div>
        )}
      </div>
    </motion.div>
  );
};
