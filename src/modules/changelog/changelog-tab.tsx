import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  useChangelog,
  useChangelogStats,
  useCreateChangelog,
  useUpdateChangelog,
  useDeleteChangelog,
} from '../../lib/supabase/queries/changelog';
import { useProjects } from '../projects/hooks/useProjects';
import type { ChangelogEntry, CreateChangelogInput } from './types/changelog';
import { ChangelogFormDrawer } from './changelog-form';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { PageHeader } from '../../components/project/PageHeader';
import { ConfirmDeleteDialog } from '../../components/ui/confirm-delete-dialog';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Folder01Icon,
  Tag01Icon,
  Search01Icon,
  Edit01Icon,
  Delete02Icon,
  Calendar01Icon,
  GitBranchIcon,
  RocketIcon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';

interface ChangelogTabProps {
  projectId?: string;
  readOnly?: boolean;
}

export const ChangelogTab: React.FC<ChangelogTabProps> = ({
  projectId: propProjectId,
  readOnly = false,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(propProjectId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<ChangelogEntry | null>(null);

  const activeProjectId = propProjectId || (selectedProjectId === 'all' ? undefined : selectedProjectId);

  const { data: projectsResult } = useProjects();
  const { data: entries = [], isLoading } = useChangelog(activeProjectId);
  const stats = useChangelogStats(activeProjectId);

  const createMutation = useCreateChangelog();
  const updateMutation = useUpdateChangelog();
  const deleteMutation = useDeleteChangelog();

  const projectsOptions = useMemo(() => {
    const rawProjects =
      (projectsResult as any)?.projects ||
      (projectsResult as any)?.data ||
      (Array.isArray(projectsResult) ? projectsResult : []);

    return rawProjects.map((p: any) => ({
      id: String(p.id),
      name: p.name || p.title || 'Untitled Project',
    }));
  }, [projectsResult]);

  const selectedProjectName = useMemo(() => {
    if (selectedProjectId === 'all') return 'All Projects';
    const found = projectsOptions.find((p: any) => p.id === selectedProjectId);
    if (found) return found.name;
    return 'Select Project';
  }, [selectedProjectId, projectsOptions]);

  // Filter entries by search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.version.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const handleFormSubmit = async (input: CreateChangelogInput & { id?: string }) => {
    if (input.id) {
      await updateMutation.mutateAsync({
        id: input.id,
        projectId: input.projectId,
        version: input.version,
        title: input.title,
        description: input.description,
        releasedAt: input.releasedAt,
      });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-[1700px] mx-auto space-y-6 font-sans text-zinc-100 select-none pb-12"
    >
      {/* Shared Platform PageHeader Component */}
      <PageHeader
        title="Changelog & Version Notes"
        description="Public release notes, SemVer tracking, and client portal version timeline"
        icon={Tag01Icon}
        actions={
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap shrink-0">
            {!readOnly && !propProjectId && (
              <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val as string)}>
                <SelectTrigger className="h-8 text-[11px] px-2.5 bg-zinc-900 border-zinc-800 font-mono text-zinc-200 hover:text-white flex items-center gap-1.5 rounded-md shrink-0 w-36 sm:w-48">
                  <HugeiconsIcon icon={Folder01Icon} size={13} className="text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[170px]">{selectedProjectName}</span>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectsOptions.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Search Bar */}
            <div className="relative w-44 sm:w-64 shrink-0">
              <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter logs..."
                className="w-full h-8 pl-8 pr-3 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-md text-[11px] font-mono text-white outline-none placeholder:text-zinc-500"
              />
            </div>

            {!readOnly && activeProjectId && (
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setIsDrawerOpen(true);
                }}
                className="h-8 px-2.5 sm:px-3 rounded-md bg-white text-black font-semibold text-xs font-mono inline-flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer shadow-md shrink-0"
                title="Create Release"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                <span className="hidden sm:inline">Create Release</span>
              </button>
            )}
          </div>
        }
      />

      {/* Release Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Total Releases</div>
          <div className="text-xl font-bold text-white tracking-tight">{stats.totalReleases}</div>
          <div className="text-[10px] text-zinc-500">Published logs</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Latest Version</div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">{stats.latestVersion}</div>
          <div className="text-[10px] text-emerald-500/70">Current release tag</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Major Milestones</div>
          <div className="text-xl font-bold text-white tracking-tight">{stats.majorReleases}</div>
          <div className="text-[10px] text-zinc-500">Production milestones</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Last Release</div>
          <div className="text-sm font-bold text-zinc-200 tracking-tight truncate">
            {stats.lastReleasedAt ? formatDistanceToNow(new Date(stats.lastReleasedAt), { addSuffix: true }) : 'Never'}
          </div>
          <div className="text-[10px] text-zinc-500">Relative timeline</div>
        </div>
      </div>

      {/* Version Timeline & Release Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-lg bg-[#0c0c0d] border border-zinc-800/40 animate-pulse" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-12 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 text-center font-mono space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <HugeiconsIcon icon={GitBranchIcon} size={22} />
          </div>
          <h4 className="text-base font-semibold text-zinc-300 font-sans">No version releases published</h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            {readOnly
              ? 'No release notes or changelog version entries published for this project yet.'
              : 'Click "Publish Release" above to log version history, technical release notes, and API changes.'}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-emerald-500/60 before:via-zinc-800 before:to-zinc-900">
          {filteredEntries.map((entry) => {
            const isMajor = entry.version.includes('.0.0') || entry.version === 'v1.0.0';
            const isPreRelease = entry.version.includes('-') || entry.version.includes('beta') || entry.version.includes('rc');

            return (
              <div key={entry.id} className="relative group">
                {/* Horizontal Connector Line */}
                <div className="absolute -left-[14px] top-[28px] -translate-y-1/2 w-3.5 h-0.5 bg-gradient-to-r from-emerald-500/90 via-emerald-500/40 to-transparent z-0" />

                {/* Timeline Node Icon */}
                <div className={`absolute -left-[14px] top-[28px] -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0c0c0d] border ${
                  isMajor ? 'border-emerald-400 shadow-emerald-500/30 text-emerald-400' : isPreRelease ? 'border-amber-500/80 text-amber-400 shadow-amber-500/20' : 'border-emerald-500/70 text-emerald-400 shadow-emerald-500/10'
                } flex items-center justify-center shadow-md z-10 transition-transform group-hover:scale-110`}>
                  <HugeiconsIcon icon={isMajor ? RocketIcon : isPreRelease ? Tag01Icon : SparklesIcon} size={10} />
                </div>

              {/* Release Card */}
              <div className="p-4 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 group-hover:border-zinc-700/80 transition-colors space-y-3 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-zinc-800/50">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-400 inline-flex items-center gap-1.5">
                      <HugeiconsIcon icon={Tag01Icon} size={13} />
                      {entry.version}
                    </span>
                    <h3 className="text-sm font-bold text-white font-sans tracking-tight">{entry.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                      <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-zinc-500" />
                      <span>{format(new Date(entry.releasedAt), 'MMM d, yyyy')}</span>
                      <span className="text-[10px] text-zinc-500">
                        ({formatDistanceToNow(new Date(entry.releasedAt), { addSuffix: true })})
                      </span>
                    </div>

                    {!readOnly && (
                      <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Release"
                        >
                          <HugeiconsIcon icon={Edit01Icon} size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Release"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="text-xs text-zinc-300 leading-relaxed font-sans pt-0.5">
                  <MarkdownPreview content={entry.description} compact />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Release Form Drawer */}
      {activeProjectId && (
        <ChangelogFormDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSubmit={handleFormSubmit}
          projectId={activeProjectId}
          initialData={editingEntry}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) {
            deleteMutation.mutate(entryToDelete.id);
            setEntryToDelete(null);
          }
        }}
        title="Delete Changelog Release"
        description={`Are you sure you want to delete version release "${entryToDelete?.version || ''}"? This action cannot be undone.`}
        confirmText="Delete Release"
      />
    </motion.div>
  );
};

export default ChangelogTab;
