import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitPullRequestIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { useGithubPullRequests } from '../../../lib/supabase/queries/github';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { Badge } from '../../../components/ui/badge';

interface PullRequestsTabProps {
  projectId: string;
  repoUrl: string;
}

export const PullRequestsTab: React.FC<PullRequestsTabProps> = ({ projectId, repoUrl }) => {
  const { data: pullRequests = [], isLoading } = useGithubPullRequests(projectId, repoUrl, true);
  const [search, setSearch] = useState('');

  const filtered = pullRequests.filter((pr: any) =>
    pr.title?.toLowerCase().includes(search.toLowerCase()) ||
    pr.user?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pull requests..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
          />
        </div>
        <span className="text-[10px] text-zinc-400 shrink-0">{filtered.length} Pull Requests</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <ProjectEmptyState title="No Pull Requests" description="No pull requests found for this repository." icon={GitPullRequestIcon} />
      ) : (
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/90 shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[500px]">
            <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <tr>
                <th className="px-3 sm:px-4 py-3">#</th>
                <th className="px-3 sm:px-4 py-3">Title</th>
                <th className="px-3 sm:px-4 py-3">Author</th>
                <th className="px-3 sm:px-4 py-3">Status</th>
                <th className="px-3 sm:px-4 py-3">Branch</th>
                <th className="px-3 sm:px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filtered.map((pr: any) => (
                <tr key={pr.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-3 sm:px-4 py-3 font-mono text-cyan-400 font-bold">#{pr.number}</td>
                  <td className="px-3 sm:px-4 py-3 font-bold text-white max-w-[200px] truncate">
                    <a href={pr.url} target="_blank" rel="noreferrer" className="hover:underline">{pr.title}</a>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      {pr.avatar && <img src={pr.avatar} alt="" className="w-4 h-4 rounded-full border border-zinc-700" />}
                      <span>{pr.user}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <Badge variant="outline" className={`rounded-sm text-[10px] uppercase font-bold ${
                      pr.state === 'open'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-purple-950/80 text-purple-300 border-purple-800'
                    }`}>
                      {pr.state}
                    </Badge>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-purple-400 font-mono truncate max-w-[100px]">{pr.branch}</td>
                  <td className="px-3 sm:px-4 py-3 text-zinc-500 font-sans">{pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
