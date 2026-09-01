import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FileCodeIcon,
  Search01Icon,
  PlusSignIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import type { Team } from '../../types/team.types';

interface TeamDocumentsViewProps {
  team: Team;
}

export const TeamDocumentsView: React.FC<TeamDocumentsViewProps> = ({ team }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team documents..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          onClick={() => navigate('/app/docs')}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New Document
        </button>
      </div>

      {/* Documents Panel */}
      <div className="p-12 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
        <HugeiconsIcon icon={FileCodeIcon} size={40} className="text-zinc-600 mx-auto" />
        <h3 className="text-sm font-semibold text-zinc-300">Team Document Hub</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Centralize shared architecture specs, process guidelines, contract notes, and project references for {team.name}.
        </p>
        <button
          onClick={() => navigate('/app/docs')}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
        >
          Open Documentation System <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      </div>
    </div>
  );
};
