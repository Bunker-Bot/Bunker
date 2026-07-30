import React from 'react';
import { motion } from 'framer-motion';
import { GitCommitIcon } from '@hugeicons/core-free-icons';
import { useGithubCommits } from '../../../lib/supabase/queries/github';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';

interface CommitsTabProps {
  projectId: string;
  repoUrl: string;
}

export const CommitsTab: React.FC<CommitsTabProps> = ({ projectId, repoUrl }) => {
  const { data: commits = [], isLoading } = useGithubCommits(projectId, repoUrl, true);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : commits.length === 0 ? (
        <ProjectEmptyState title="No Commits Loaded" description="Sync repository to fetch commit log history." icon={GitCommitIcon} />
      ) : (
        <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <span className="font-bold text-white text-xs">Commit History ({commits.length})</span>
            <span className="text-[10px] text-zinc-500 font-sans">Newest First</span>
          </div>

          <div className="relative border-l border-zinc-800 ml-2 sm:ml-3 pl-3 sm:pl-4 space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {commits.map((commit: any, i: number) => (
              <div key={commit.sha || i} className="relative space-y-1.5 p-3 rounded bg-zinc-950 border border-zinc-850">
                <span className="absolute -left-[18px] sm:-left-[21px] top-4 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 border-2 border-zinc-950" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs">
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    {commit.avatar && (
                      <img src={commit.avatar} alt="" className="w-5 h-5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span className="font-bold text-white text-xs sm:text-sm break-words min-w-0">{commit.message}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-cyan-400 font-mono whitespace-nowrap shrink-0">
                    {commit.shortSha || commit.sha?.substring(0, 7)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-zinc-400 font-sans">
                  <span>Author: <strong className="text-zinc-200 font-mono">{commit.author}</strong></span>
                  <span className="text-[10px] text-zinc-500 font-mono">{commit.date ? new Date(commit.date).toLocaleString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
