import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Flag01Icon,
  Add01Icon,
  AlertCircleIcon,
  RefreshIcon
} from '@hugeicons/core-free-icons';
import { MilestoneRepository } from '../../lib/repositories/milestone.repository';
import { useProjects } from '../../lib/supabase/queries/projects';
import { ConfirmDeleteDialog } from '../../components/ui/confirm-delete-dialog';
import type { Milestone } from '../../types';
import { MilestoneStatistics } from './components/milestone-statistics';
import { MilestoneFilters } from './components/milestone-filters';
import { MilestoneTimeline } from './components/milestone-timeline';
import { MilestoneForm } from './milestone-form';

interface MilestonesTabProps {
  projectId?: string;
  readonly?: boolean;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({
  projectId = '',
  readonly = false,
}) => {
  const queryClient = useQueryClient();

  // State for Project Selection (when opened outside a specific project context)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId);
  const activeProjectId = projectId || selectedProjectId;

  // Fetch Projects List from Supabase for Project Selector
  const { data: projectsResult } = useProjects();
  const projectsList = React.useMemo(() => {
    const raw = (projectsResult as any)?.projects || (Array.isArray(projectsResult) ? projectsResult : []);
    return raw.map((p: any) => ({ id: String(p.id), name: p.name || 'Untitled Project' }));
  }, [projectsResult]);

  // State for filters & dialogs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sort_order');
  const [viewMode, setViewMode] = useState<'timeline' | 'cards'>('timeline');
  const [collapseCompleted, setCollapseCompleted] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);

  // React Query Fetch Real Milestones from Supabase (No Dummy Data)
  const {
    data: fetchedMilestones,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['milestones', activeProjectId || 'all'],
    queryFn: async () => {
      return await MilestoneRepository.getMilestonesByProject(activeProjectId);
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const milestonesList = fetchedMilestones || [];

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (mData: Partial<Milestone>) => {
      if (mData.id && mData.id.length > 10) {
        return await MilestoneRepository.updateMilestone(mData.id, mData);
      }
      return await MilestoneRepository.createMilestone({
        ...mData,
        project_id: activeProjectId || mData.project_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mId: string) => {
      return await MilestoneRepository.deleteMilestone(mId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      setDeletingMilestoneId(null);
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ mId, currentStatus }: { mId: string; currentStatus: string }) => {
      return await MilestoneRepository.toggleMilestoneComplete(mId, currentStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingMilestone(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (m: Milestone) => {
    setEditingMilestone(m);
    setIsDialogOpen(true);
  };

  const handleDeleteMilestone = (mId: string) => {
    setDeletingMilestoneId(mId);
  };

  const handleConfirmDelete = async () => {
    if (deletingMilestoneId) {
      await deleteMutation.mutateAsync(deletingMilestoneId);
    }
  };

  const handleToggleComplete = (mId: string, currentStatus: string) => {
    toggleCompleteMutation.mutate({ mId, currentStatus });
  };

  const handleDuplicateMilestone = (m: Milestone) => {
    saveMutation.mutate({
      project_id: activeProjectId || m.project_id,
      name: `${m.name || m.title} (Copy)`,
      description: m.description || m.notes,
      priority: m.priority,
      status: 'pending',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: m.due_date || m.dueDate,
      owner_name: m.owner_name || m.ownerName,
      labels: m.labels,
    });
  };

  const handleAddAttachment = async (mId: string, fileName: string, fileUrl: string) => {
    try {
      await MilestoneRepository.addAttachment(mId, fileName, fileUrl);
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    } catch (_e) {}
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await MilestoneRepository.deleteAttachment(attachmentId);
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    } catch (_e) {}
  };

  // Reorder up/down
  const handleMoveUp = (mId: string) => {
    const idx = milestonesList.findIndex((m) => m.id === mId);
    if (idx > 0) {
      const prev = milestonesList[idx - 1];
      const curr = milestonesList[idx];
      MilestoneRepository.reorderMilestones([
        { id: curr.id, sort_order: prev.sort_order || idx - 1 },
        { id: prev.id, sort_order: curr.sort_order || idx },
      ]).then(() => queryClient.invalidateQueries({ queryKey: ['milestones'] }));
    }
  };

  const handleMoveDown = (mId: string) => {
    const idx = milestonesList.findIndex((m) => m.id === mId);
    if (idx !== -1 && idx < milestonesList.length - 1) {
      const next = milestonesList[idx + 1];
      const curr = milestonesList[idx];
      MilestoneRepository.reorderMilestones([
        { id: curr.id, sort_order: next.sort_order || idx + 1 },
        { id: next.id, sort_order: curr.sort_order || idx },
      ]).then(() => queryClient.invalidateQueries({ queryKey: ['milestones'] }));
    }
  };

  // Filter & Sort Logic
  const now = new Date();

  const filteredMilestones = milestonesList
    .filter((m) => {
      const title = (m.name || m.title || '').toLowerCase();
      const desc = (m.description || m.notes || '').toLowerCase();
      const owner = (m.owner_name || m.ownerName || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      if (query && !title.includes(query) && !desc.includes(query) && !owner.includes(query)) {
        return false;
      }

      const isCompleted = m.status === 'completed' || (m.progress || 0) >= 100;
      const isOverdue = !isCompleted && (m.due_date || m.dueDate) && new Date(m.due_date || m.dueDate!) < now;

      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'in_progress' && (isCompleted || (m.progress || 0) === 0)) return false;
      if (statusFilter === 'pending' && (isCompleted || (m.progress || 0) > 0)) return false;
      if (statusFilter === 'overdue' && !isOverdue) return false;

      if (priorityFilter !== 'all' && (m.priority || 'medium') !== priorityFilter) return false;

      if (collapseCompleted && isCompleted) return false;
      if (onlyPending && isCompleted) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'due_date') {
        const dateA = a.due_date || a.dueDate || '9999';
        const dateB = b.due_date || b.dueDate || '9999';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'progress') {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === 'name') {
        return (a.name || a.title || '').localeCompare(b.name || b.title || '');
      }
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-4 sm:space-y-6 font-sans text-xs select-none overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
            <HugeiconsIcon icon={Flag01Icon} size={18} />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight leading-snug break-words">
                <span className="sm:hidden">Milestones</span>
                <span className="hidden sm:inline">Project Delivery Checkpoints & Milestones</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-sm bg-cyan-950 text-cyan-400 border border-cyan-800/80 uppercase whitespace-nowrap shrink-0">
                {readonly ? 'Client View' : 'Admin CRUD'}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-sans leading-relaxed hidden sm:block">
              Track major project delivery checkpoints, scope deliverables, dependencies, and target release schedules.
            </p>
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed sm:hidden">
              Track delivery checkpoints & release schedules.
            </p>
          </div>
        </div>

        {!readonly && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-850">
            <button
              onClick={() => refetch()}
              className="p-2.5 sm:p-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Refresh Milestones"
            >
              <HugeiconsIcon icon={RefreshIcon} size={15} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg whitespace-nowrap"
            >
              <HugeiconsIcon icon={Add01Icon} size={15} />
              <span>Create Milestone</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <MilestoneStatistics milestones={milestonesList} />

      {/* Toolbar Filters with Select Component */}
      <MilestoneFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        collapseCompleted={collapseCompleted}
        onToggleCollapseCompleted={() => setCollapseCompleted(!collapseCompleted)}
        onlyPending={onlyPending}
        onToggleOnlyPending={() => setOnlyPending(!onlyPending)}
        projects={!readonly && !projectId ? projectsList : []}
        selectedProjectId={selectedProjectId}
        onProjectChange={!readonly && !projectId ? setSelectedProjectId : undefined}
      />

      {/* Error Banner */}
      {isError && (
        <div className="p-4 rounded-sm bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} size={18} className="text-rose-400 shrink-0" />
            <span>Failed to load milestones: {(error as any)?.message || 'Database query error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded-sm text-xs font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-sm bg-zinc-950/80 border border-zinc-800 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">Fetching project milestones...</p>
        </div>
      )}

      {/* Milestone List / Stepper View */}
      {!isLoading && (
        <MilestoneTimeline
          milestones={filteredMilestones}
          readonly={readonly}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteMilestone}
          onToggleComplete={handleToggleComplete}
          onDuplicate={handleDuplicateMilestone}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}

      {/* Admin Milestone Form Drawer / Modal */}
      {!readonly && (
        <MilestoneForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          milestoneToEdit={editingMilestone}
          projectId={activeProjectId}
        />
      )}

      {/* Confirm Delete AlertDialog Component */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingMilestoneId)}
        onClose={() => setDeletingMilestoneId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project Milestone"
        description="Are you sure you want to delete this delivery milestone? This action will remove its deliverables, attachments, and progress checkpoint."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default MilestonesTab;
