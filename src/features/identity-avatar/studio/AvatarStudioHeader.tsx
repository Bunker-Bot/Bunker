import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  DashboardSquare01Icon,
  Menu01Icon,
} from '@hugeicons/core-free-icons';
import type { AvatarStudioFilter, AvatarStudioViewMode } from '../types/avatar.types';

interface AvatarStudioHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: AvatarStudioFilter;
  onFilterChange: (val: AvatarStudioFilter) => void;
  viewMode: AvatarStudioViewMode;
  onViewModeChange: (val: AvatarStudioViewMode) => void;
  totalCount: number;
  assignedCount: number;
  unassignedCount: number;
  onOpenCreate: () => void;
}

export const AvatarStudioHeader: React.FC<AvatarStudioHeaderProps> = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  assignedCount,
  unassignedCount,
}) => {
  return (
    <div className="w-full space-y-4 font-mono select-none">
      {/* Metrics & Search Controls Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-sm bg-zinc-900/70 border border-zinc-800 shadow-sm w-full">
        {/* Left: Search input */}
        <div className="relative w-full md:max-w-md">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, #10-digit code, client, project..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-cyan-400"
          />
        </div>

        {/* Right: Metrics + Status Filters + View Mode */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-sm border border-zinc-800 text-xs shrink-0">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('assigned')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'assigned'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('unassigned')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'unassigned'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              Unassigned ({unassignedCount})
            </button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block shrink-0" />

          {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-sm border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              title="Grid View"
            >
              <HugeiconsIcon icon={DashboardSquare01Icon} size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              title="List View"
            >
              <HugeiconsIcon icon={Menu01Icon} size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarStudioHeader;
