import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, CheckmarkCircle02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useGithubActions } from '../../../lib/supabase/queries/github';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { Badge } from '../../../components/ui/badge';

interface ActionsTabProps {
  projectId: string;
  repoUrl: string;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({ projectId, repoUrl }) => {
  const { data: workflows = [], isLoading } = useGithubActions(projectId, repoUrl, true);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <ProjectEmptyState title="No Workflow Runs" description="No GitHub Actions workflow runs found. Sync repository to fetch CI/CD data." icon={PlayIcon} />
      ) : (
        <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <HugeiconsIcon icon={PlayIcon} size={14} className="text-cyan-400" />
              <span>CI/CD Workflow Runs ({workflows.length})</span>
            </div>
          </div>

          <div className="rounded-sm border border-zinc-800 bg-zinc-950 shadow-md overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                <tr>
                  <th className="px-3 sm:px-4 py-3">Workflow</th>
                  <th className="px-3 sm:px-4 py-3">Status</th>
                  <th className="px-3 sm:px-4 py-3">Branch</th>
                  <th className="px-3 sm:px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {workflows.map((wf: any) => {
                  const isSuccess = wf.conclusion === 'success';
                  return (
                    <tr key={wf.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="px-3 sm:px-4 py-3 font-bold text-white">
                        <div className="space-y-0.5">
                          <a href={wf.url} target="_blank" rel="noreferrer" className="hover:underline">{wf.name}</a>
                          {wf.commitMessage && (
                            <p className="text-[10px] text-zinc-500 font-sans font-normal truncate max-w-[200px] sm:max-w-xs">{wf.commitMessage}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <Badge variant="outline" className={`rounded-sm text-[10px] uppercase font-bold flex items-center gap-1 w-fit ${
                          isSuccess
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : wf.conclusion === 'failure'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        }`}>
                          <HugeiconsIcon icon={isSuccess ? CheckmarkCircle02Icon : Cancel01Icon} size={11} />
                          <span>{wf.conclusion || wf.status}</span>
                        </Badge>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-purple-400 font-mono">{wf.headBranch}</td>
                      <td className="px-3 sm:px-4 py-3 text-zinc-500 font-sans">{wf.createdAt ? new Date(wf.createdAt).toLocaleString() : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
