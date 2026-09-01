import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GitBranchIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import type { Team } from '../../types/team.types';

interface TeamGithubViewProps {
  team: Team;
}

export const TeamGithubView: React.FC<TeamGithubViewProps> = ({ team }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-mono">
      <div className="p-12 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-sm space-y-3">
        <HugeiconsIcon icon={GitBranchIcon} size={40} className="text-cyan-400 mx-auto" />
        <h3 className="text-sm font-semibold text-zinc-200">GitHub Workspace Integration</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Associate project repositories with {team.name} to monitor pull requests, branch releases, and commits stream.
        </p>
        <button
          onClick={() => navigate('/app/github')}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-sm transition-colors inline-flex items-center gap-1.5"
        >
          Manage Repositories <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      </div>
    </div>
  );
};
