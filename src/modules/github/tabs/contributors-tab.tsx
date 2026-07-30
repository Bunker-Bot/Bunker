import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, Link01Icon } from '@hugeicons/core-free-icons';
import { useGithubContributors } from '../../../lib/supabase/queries/github';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { Badge } from '../../../components/ui/badge';

interface ContributorsTabProps {
  projectId: string;
  repoUrl: string;
}

export const ContributorsTab: React.FC<ContributorsTabProps> = ({ projectId, repoUrl }) => {
  const { data: contributors = [], isLoading } = useGithubContributors(projectId, repoUrl, true);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (contributors.length === 0) {
    return <ProjectEmptyState title="No Contributors Found" description="Sync repository to load contributor data." icon={UserGroupIcon} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <HugeiconsIcon icon={UserGroupIcon} size={15} className="text-cyan-400" />
            <span>Repository Contributors ({contributors.length})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {contributors.map((c: any) => (
            <div key={c.login} className="p-3.5 sm:p-4 rounded bg-zinc-950 border border-zinc-850 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.login} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-700" />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-sm">
                      {c.login?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-white text-sm block truncate">{c.login}</span>
                  </div>
                </div>

                <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] font-bold shrink-0">
                  {c.contributions} commits
                </Badge>
              </div>

              <div className="flex items-center justify-end text-[10px] text-zinc-400 font-sans border-t border-zinc-850 pt-2">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-300 hover:text-white font-bold flex items-center gap-1 font-mono"
                >
                  <span>Profile</span>
                  <HugeiconsIcon icon={Link01Icon} size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
