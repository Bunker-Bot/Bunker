import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon, StarIcon, GitForkIcon } from '@hugeicons/core-free-icons';

interface GitHubRepoCardProps {
  url: string;
}

export const GitHubRepoCard: React.FC<GitHubRepoCardProps> = ({ url }) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer select-none no-underline"
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={GitBranchIcon} size={16} className="text-zinc-400 shrink-0" />
          <span className="font-mono text-xs font-bold text-white group-hover:text-zinc-100 truncate">
            {owner}/{repo}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
            Public Repo
          </span>
        </div>
        <p className="text-xs text-zinc-400 line-clamp-1 font-normal">
          Connected GitHub repository reference for deployment code & architecture schemas.
        </p>
      </div>

      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 shrink-0">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>TypeScript</span>
        </div>
        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={StarIcon} size={13} className="text-amber-400" />
          <span>1.2k</span>
        </div>
        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={GitForkIcon} size={13} className="text-zinc-500" />
          <span>142</span>
        </div>
      </div>
    </a>
  );
};

export default GitHubRepoCard;
