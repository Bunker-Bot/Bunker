import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon, RefreshIcon, Link01Icon } from '@hugeicons/core-free-icons';
import { useClientGithub } from '../../../../lib/supabase/queries/clients';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';
import { Badge } from '../../../../components/ui/badge';

interface GithubTabProps {
  clientId: string;
}

export const GithubTab: React.FC<GithubTabProps> = ({ clientId }) => {
  const { data: repos, isLoading, refetch } = useClientGithub(clientId, true);
  const items = repos || [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-white font-bold">
          <HugeiconsIcon icon={GithubIcon} size={16} />
          <span>Connected Repositories ({items.length})</span>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer font-bold transition-colors"
        >
          <HugeiconsIcon icon={RefreshIcon} size={14} />
          <span>Manual Sync</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ProjectEmptyState title="No GitHub Repositories Linked" description="Link a GitHub repository to client projects to track branches, open issues, and PRs." icon={GithubIcon} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((repo: any) => (
            <div key={repo.id} className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-white text-sm">{repo.projectName}</span>
                <Badge variant="outline" className="rounded-sm bg-zinc-950 text-emerald-400 border-emerald-800 text-[10px] uppercase font-bold">
                  {repo.branch || 'main'}
                </Badge>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Organization:</span>
                  <span className="font-bold text-zinc-200">{repo.organization || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Open Issues / PRs:</span>
                  <span className="font-bold text-cyan-400">{repo.open_issues || 0} Issues / {repo.open_prs || 0} PRs</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Latest Release:</span>
                  <span className="font-bold text-emerald-400">{repo.latest_version || 'v1.0.0'}</span>
                </div>
              </div>

              {repo.repo_url && (
                <a
                  href={repo.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-colors"
                >
                  <HugeiconsIcon icon={Link01Icon} size={13} />
                  <span>Open Repository</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
