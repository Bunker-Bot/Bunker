import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useProjects,
  useProjectCounts,
  useDeleteProject,
  useClientsForSelect,
} from '../../lib/supabase/queries/projects';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { ProjectEmptyState } from '../../components/project/ProjectEmptyState';
import { PageHeader } from '../../components/project/PageHeader';
import { Select } from '../../../packages/ui/src/components/select';
import { ProjectFormDrawer } from './project-form-drawer';
import { cardContainerVariants, cardItemVariants } from '../../../packages/ui/src/theme/motion';
import { WorkspaceKpiCards } from './components/workspace-kpi-cards';
import { WorkspaceSidebar } from './components/workspace-sidebar';
import { ProjectDashboardCard } from './components/project-dashboard-card';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  PlusSignIcon,
  Edit01Icon,
  Delete02Icon,
  ViewIcon,
  RefreshIcon,
  Clock01Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Search01Icon,
  Cancel01Icon,
  Download01Icon,
  GridIcon,
  Menu01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArchiveIcon,
  FileCodeIcon
} from '@hugeicons/core-free-icons';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'deadline' | 'completion_percent' | 'name'>('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<{ id: string; slug: string; top: number; left: number } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);

  const deleteMutation = useDeleteProject();

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Keyboard shortcut listener (/ or Ctrl+K focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('bunker-global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close portal dropdown on window scroll or resize
  useEffect(() => {
    const handleDismiss = () => setActiveMenu(null);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, []);

  const { data: rawCounts, isLoading: isCountsLoading } = useProjectCounts();
  const counts: any = rawCounts || {};
  const { data: clientsOptions } = useClientsForSelect();
  
  const { data, isLoading, isFetching, isError, refetch } = useProjects({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    clientId: clientFilter !== 'all' ? clientFilter : undefined,
    sortBy,
    sortOrder: sortBy === 'name' ? 'asc' : 'desc',
  });

  // Scoped Realtime channel on projects table
  useRealtimeSubscription({
    table: 'projects',
    queryKeyToInvalidate: ['projects'],
  });

  const projects = data?.projects || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await deleteMutation.mutateAsync(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleExportCSV = () => {
    if (!projects || projects.length === 0) return;
    const headers = ['Name', 'Slug', 'Client', 'Status', 'Priority', 'Completion %', 'Deadline', 'Updated At'];
    const rows = projects.map((p: any) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.slug || ''}"`,
      `"${(p.clientName || '').replace(/"/g, '""')}"`,
      `"${p.status || ''}"`,
      `"${p.priority || ''}"`,
      `"${p.completionPercent || 0}"`,
      `"${p.deadline || ''}"`,
      `"${p.formattedUpdatedAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bunker-projects-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-5 p-3 sm:p-6 text-zinc-100 font-mono select-none">
      {/* 1. Header with Quick Statistics */}
      <PageHeader
        title="Project Workspace & Directory"
        description="Manage and monitor all active and historical client contract deliverables from a single workspace."
        icon={Folder01Icon}
        badge={`${counts.totalProjects || 0} Total Projects`}
        stats={[
          { label: 'Active', value: counts.activeProjects || 0, icon: Clock01Icon },
          { label: 'Completed', value: counts.completedProjects || 0, icon: CheckmarkCircle02Icon },
          { label: 'Archived', value: counts.archivedProjects || 0, icon: ArchiveIcon },
          { label: 'Overdue', value: counts.overdueProjects || 0, icon: AlertCircleIcon },
          { label: 'Draft', value: counts.draftProjects || 0, icon: FileCodeIcon },
          { label: 'Total Clients', value: counts.totalClients || 0, icon: UserGroupIcon },
        ]}
        actions={
          <button
            onClick={() => {
              setProjectToEdit(null);
              setIsDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-lg shrink-0 transition-transform active:scale-95"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span className="hidden sm:inline">New Project</span>
          </button>
        }
      />

      {/* 2. Workspace KPI Cards Row */}
      <WorkspaceKpiCards counts={counts} isLoading={isCountsLoading} />

      {/* 3. Search & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full p-3 rounded-sm bg-zinc-900/90 border border-zinc-800/80 shadow-md">
        {/* Global Search Input with Debounce & Shortcut */}
        <div className="relative flex-1 max-w-lg">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            id="bunker-global-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, slug, client, or tech..."
            className="w-full pl-9 pr-14 py-2 rounded-sm bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono transition-colors"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 pointer-events-none">
              /
            </span>
          )}
        </div>

        {/* Filters & Actions Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'planning', label: 'Planning' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onChange={(val) => {
              setPriorityFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
          />

          {/* Client Filter */}
          <Select
            value={clientFilter}
            onChange={(val) => {
              setClientFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Clients' },
              ...(clientsOptions || []),
            ]}
          />

          {/* Sort By */}
          <Select
            value={sortBy}
            onChange={(val: any) => setSortBy(val)}
            options={[
              { value: 'updated_at', label: 'Recently Updated' },
              { value: 'created_at', label: 'Recently Created' },
              { value: 'deadline', label: 'Deadline' },
              { value: 'completion_percent', label: 'Completion' },
              { value: 'name', label: 'Name (A-Z)' },
            ]}
          />

          {/* Export CSV Action */}
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-zinc-950 text-zinc-300 border border-zinc-800 text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-all shrink-0"
          >
            <HugeiconsIcon icon={Download01Icon} size={15} className="text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-sm p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1 rounded-sm transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <HugeiconsIcon icon={GridIcon} size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1 rounded-sm transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <HugeiconsIcon icon={Menu01Icon} size={15} />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            title="Refresh Directory"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-zinc-950 text-zinc-300 border border-zinc-800 text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-all shrink-0"
          >
            <HugeiconsIcon icon={RefreshIcon} size={15} className={`text-zinc-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 4. Main 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Area: Project Cards Grid (8 Columns on Desktop) */}
        <main className="lg:col-span-8 space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-sm bg-zinc-900/60 border border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center border border-zinc-800/80 rounded-sm bg-zinc-900/80 space-y-3">
              <p className="text-xs text-zinc-400 font-mono">Unable to load project workspace directory.</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-zinc-800 text-white rounded-sm text-xs font-bold cursor-pointer">
                Retry Query
              </button>
            </div>
          ) : projects.length === 0 ? (
            <ProjectEmptyState
              title="No Workspace Projects Found"
              description={debouncedSearch ? `No project records matching "${debouncedSearch}".` : 'Create your first project record to begin tracking client deliverables.'}
              icon={Folder01Icon}
              action={
                <button
                  onClick={() => {
                    setProjectToEdit(null);
                    setIsDrawerOpen(true);
                  }}
                  className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-lg"
                >
                  New Project
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              <motion.div
                variants={cardContainerVariants}
                initial="initial"
                animate="animate"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'space-y-3'
                }
              >
                {projects.map((project: any) => (
                  <motion.div key={project.id} variants={cardItemVariants}>
                    <ProjectDashboardCard
                      project={project}
                      onOpenMenu={(proj, e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActiveMenu({
                          id: proj.id,
                          slug: proj.slug,
                          top: rect.bottom + 4,
                          left: rect.right - 144,
                        });
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* 5. Server-Side Pagination Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-zinc-400 font-mono border-t border-zinc-800/80">
                <span>
                  Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)} of {totalCount} Projects
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                    <span>Previous</span>
                  </button>

                  <span className="px-2 font-bold text-white">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Area: Sticky Workspace Sidebar (4 Columns on Desktop) */}
        <div className="lg:col-span-4">
          <WorkspaceSidebar
            onOpenNewProject={() => {
              setProjectToEdit(null);
              setIsDrawerOpen(true);
            }}
            onExportProjects={handleExportCSV}
          />
        </div>
      </div>

      {/* Global Context Menu Dropdown */}
      {activeMenu &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: activeMenu.top,
              left: activeMenu.left,
            }}
            className="z-[99999] w-36 py-1 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl font-mono text-xs space-y-0.5 text-left"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              onClick={() => {
                const targetSlug = activeMenu.slug;
                setActiveMenu(null);
                navigate(`/app/projects/${targetSlug}`);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer"
            >
              <HugeiconsIcon icon={ViewIcon} size={14} />
              <span>Open Project</span>
            </button>
            <button
              onClick={() => {
                const targetProj = projects.find((p: any) => p.id === activeMenu.id);
                setActiveMenu(null);
                setProjectToEdit(targetProj);
                setIsDrawerOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer"
            >
              <HugeiconsIcon icon={Edit01Icon} size={14} />
              <span>Edit Project</span>
            </button>
            <button
              onClick={() => {
                const targetProj = projects.find((p: any) => p.id === activeMenu.id);
                setActiveMenu(null);
                setProjectToDelete(targetProj);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 cursor-pointer"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )}

      {/* Slide-over Project Form Drawer */}
      <ProjectFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projectToEdit={projectToEdit}
      />

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-mono">
          <div className="w-full max-w-md p-6 rounded-sm bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <HugeiconsIcon icon={Delete02Icon} size={18} />
              <span>Delete Project Record</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete project <strong className="text-white">{projectToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-sm bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;
