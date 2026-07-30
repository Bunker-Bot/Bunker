import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Grid02Icon,
  Menu01Icon,
  CheckmarkCircle02Icon,
  Folder01Icon
} from '@hugeicons/core-free-icons';
import { Select, type SelectOption } from '../../../../packages/ui/src/components/select';

interface MilestoneFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'timeline' | 'cards';
  onViewModeChange: (mode: 'timeline' | 'cards') => void;
  collapseCompleted: boolean;
  onToggleCollapseCompleted: () => void;
  onlyPending: boolean;
  onToggleOnlyPending: () => void;
  // Optional Project Selection
  projects?: { id: string; name: string }[];
  selectedProjectId?: string;
  onProjectChange?: (projectId: string) => void;
}

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

const PRIORITY_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'sort_order', label: 'Sort: Roadmap Order' },
  { value: 'due_date', label: 'Sort: Due Date' },
  { value: 'progress', label: 'Sort: Progress %' },
  { value: 'name', label: 'Sort: Name' },
];

export const MilestoneFilters: React.FC<MilestoneFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  collapseCompleted,
  onToggleCollapseCompleted,
  onlyPending,
  onToggleOnlyPending,
  projects = [],
  selectedProjectId = '',
  onProjectChange,
}) => {
  const projectSelectOptions: SelectOption[] = [
    { value: '', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="p-3 sm:p-4 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-3 font-mono text-xs select-none shadow-lg">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        
        {/* ROW 1: Project Selector & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Project Selector (If available) */}
          {onProjectChange && projects.length > 0 && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
              <HugeiconsIcon icon={Folder01Icon} size={14} className="text-cyan-400 shrink-0" />
              <Select
                value={selectedProjectId}
                onChange={onProjectChange}
                options={projectSelectOptions}
                className="w-full sm:w-[170px] bg-zinc-900 border-zinc-800 text-xs text-white"
              />
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter milestones by title, owner, or release..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-600 font-sans"
            />
          </div>
        </div>

        {/* ROW 2: Filter & Sort Controls Grid (Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="col-span-1">
            <Select
              value={statusFilter}
              onChange={onStatusChange}
              options={STATUS_FILTER_OPTIONS}
              className="w-full sm:w-full md:w-[135px] bg-zinc-900 border-zinc-800 text-xs text-white"
            />
          </div>

          {/* Priority Select */}
          <div className="col-span-1">
            <Select
              value={priorityFilter}
              onChange={onPriorityChange}
              options={PRIORITY_FILTER_OPTIONS}
              className="w-full sm:w-full md:w-[130px] bg-zinc-900 border-zinc-800 text-xs text-white"
            />
          </div>

          {/* Sort By Select */}
          <div className="col-span-1">
            <Select
              value={sortBy}
              onChange={onSortChange}
              options={SORT_OPTIONS}
              className="w-full sm:w-full md:w-[160px] bg-zinc-900 border-zinc-800 text-xs text-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="col-span-1 flex items-center justify-end sm:justify-start">
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-sm border border-zinc-800 shrink-0 h-8 sm:h-9 px-1">
              <button
                type="button"
                onClick={() => onViewModeChange('timeline')}
                className={`px-3 py-1 sm:px-2 rounded-sm transition-all cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-zinc-800 text-white shadow font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Vertical Stepper Timeline View"
              >
                <HugeiconsIcon icon={Menu01Icon} size={14} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('cards')}
                className={`px-3 py-1 sm:px-2 rounded-sm transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-zinc-800 text-white shadow font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid Cards View"
              >
                <HugeiconsIcon icon={Grid02Icon} size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Toggles Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2.5 border-t border-zinc-850 text-[11px] font-sans text-zinc-400">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={collapseCompleted}
            onChange={onToggleCollapseCompleted}
            className="rounded-sm bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <span>Collapse Completed Milestones</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={onToggleOnlyPending}
            className="rounded-sm bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-amber-400 shrink-0" />
            <span>Show Only Pending & Active</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default MilestoneFilters;
