import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon, Download01Icon } from '@hugeicons/core-free-icons';
import { ProjectSearchInput } from '../../../components/project/ProjectSearchInput';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';
import { useClientCountries } from '../../../lib/supabase/queries/clients';

interface ClientToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onSearchClear: () => void;
  country: string;
  onCountryChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  activeProjects: string;
  onActiveProjectsChange: (val: string) => void;
  registrationDate: string;
  onRegistrationDateChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
}

export const ClientToolbar: React.FC<ClientToolbarProps> = ({
  search,
  onSearchChange,
  onSearchClear,
  country,
  onCountryChange,
  status,
  onStatusChange,
  activeProjects,
  onActiveProjectsChange,
  registrationDate,
  onRegistrationDateChange,
  sortBy,
  onSortByChange,
  onRefresh,
  onExportCsv,
}) => {
  const { data: countriesList } = useClientCountries();
  const countries = countriesList || [];

  return (
    <div className="p-3 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm font-mono text-xs select-none space-y-3">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="w-full sm:max-w-xs md:max-w-sm">
          <ProjectSearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={onSearchClear}
            placeholder="Search name, company, email..."
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onRefresh}
            className="p-2 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors"
            title="Refresh Directory"
          >
            <HugeiconsIcon icon={RefreshIcon} size={15} />
          </button>

          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs cursor-pointer transition-colors"
            title="Export Directory CSV"
          >
            <HugeiconsIcon icon={Download01Icon} size={14} className="text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Select Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full pt-1 border-t border-zinc-800/80">
        {/* Country Filter */}
        <Select value={country} onValueChange={(val: any) => onCountryChange(val || 'all')}>
          <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 text-xs">
            <SelectValue>
              {country === 'all' ? 'Country: All' : country}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <SelectItem value="all">Country: All</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Health Status Filter */}
        <Select value={status} onValueChange={(val: any) => onStatusChange(val || 'all')}>
          <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 text-xs">
            <SelectValue>
              {status === 'all' ? 'Status: All' : status === 'healthy' ? 'Status: Healthy' : status === 'at_risk' ? 'Status: At Risk' : 'Status: Inactive'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Projects Filter */}
        <Select value={activeProjects} onValueChange={(val: any) => onActiveProjectsChange(val || 'all')}>
          <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 text-xs">
            <SelectValue>
              {activeProjects === 'all' ? 'Projects: All' : activeProjects === 'has_active' ? 'Has Active' : 'No Active'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <SelectItem value="all">Projects: All</SelectItem>
            <SelectItem value="has_active">Has Active Projects</SelectItem>
            <SelectItem value="no_active">No Active Projects</SelectItem>
          </SelectContent>
        </Select>

        {/* Registration Date Filter */}
        <Select value={registrationDate} onValueChange={(val: any) => onRegistrationDateChange(val || 'all')}>
          <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 text-xs">
            <SelectValue>
              {registrationDate === 'all' ? 'Date: All Time' : registrationDate === 'last_30_days' ? 'Last 30 Days' : 'Last 90 Days'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <SelectItem value="all">Date: All Time</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By Filter */}
        <Select value={sortBy} onValueChange={(val: any) => onSortByChange(val || 'created_at')}>
          <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 text-xs col-span-2 sm:col-span-1">
            <SelectValue>
              {sortBy === 'created_at' ? 'Sort: Recent' : sortBy === 'updated_at' ? 'Sort: Updated' : sortBy === 'name' ? 'Sort: Name' : sortBy === 'company' ? 'Sort: Company' : 'Sort: Projects'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <SelectItem value="created_at">Recently Created</SelectItem>
            <SelectItem value="updated_at">Recently Updated</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="company">Company (A-Z)</SelectItem>
            <SelectItem value="most_projects">Most Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
