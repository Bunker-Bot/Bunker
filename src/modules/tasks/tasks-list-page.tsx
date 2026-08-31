import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useTasks,
  useTaskStatistics,
  useTaskModules,
  useUpdateTask,
  useBulkUpdateTasks,
  useDeleteTask,
  useBulkDeleteTasks,
  useCreateTask,
  useMoveTask
} from '../../lib/supabase/queries/tasks';
import { useProjects } from '../../lib/supabase/queries/projects';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import type { TaskItem, TaskPriority, TaskStatus } from '../../lib/repositories/task.repository';
import { TaskFormDrawer } from './task-form-drawer';
import { TaskDetailDrawer } from './task-detail-drawer';
import { KanbanTaskCard } from '../kanban/task-card';
import { PageHeader } from '../../../packages/ui/src/components/page-header';
import { Select } from '../../../packages/ui/src/components/select';
import { DatePicker } from '../../../packages/ui/src/components/date-picker';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Task01Icon,
  PlusSignIcon,
  Search01Icon,
  Grid02Icon,
  Menu01Icon,
  Edit01Icon,
  Delete02Icon,
  Copy01Icon,
  Tag01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon
} from '@hugeicons/core-free-icons';

const STATUS_COLUMNS: { key: TaskStatus; label: string; bg: string; border: string; color: string }[] = [
  { key: 'todo', label: 'Todo', bg: 'bg-zinc-950/60', border: 'border-zinc-800', color: 'text-zinc-400' },
  { key: 'in_progress', label: 'In Progress', bg: 'bg-cyan-950/20', border: 'border-cyan-900/50', color: 'text-cyan-400' },
  { key: 'review', label: 'In Review', bg: 'bg-purple-950/20', border: 'border-purple-900/50', color: 'text-purple-400' },
  { key: 'testing', label: 'Testing', bg: 'bg-amber-950/20', border: 'border-amber-900/50', color: 'text-amber-400' },
  { key: 'completed', label: 'Completed', bg: 'bg-emerald-950/20', border: 'border-emerald-900/50', color: 'text-emerald-400' },
];

const STATUS_SELECT_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Testing', value: 'testing' },
  { label: 'Completed', value: 'completed' },
];

const PRIORITY_SELECT_OPTIONS = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const DUE_DATE_SELECT_OPTIONS = [
  { label: 'All Due Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Upcoming', value: 'upcoming' },
];

const SORT_OPTIONS = [
  { label: 'Sort: Created Date', value: 'created_at' },
  { label: 'Sort: Due Date', value: 'due_date' },
  { label: 'Sort: Priority', value: 'priority' },
  { label: 'Sort: Progress', value: 'progress' },
  { label: 'Sort: Status', value: 'status' },
  { label: 'Sort: Module', value: 'module' },
  { label: 'Sort: Title', value: 'title' },
];

/* Droppable Column Component for Tasks List Kanban View */
const TaskDroppableColumn: React.FC<{
  col: typeof STATUS_COLUMNS[number];
  colTasks: TaskItem[];
  onAddNew: (status: TaskStatus) => void;
  onOpenDetail: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDuplicate: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}> = ({ col, colTasks, onAddNew, onOpenDetail, onEdit, onDuplicate, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      id={col.key}
      className={`p-3.5 rounded border transition-colors ${col.border} ${col.bg} ${isOver ? 'ring-2 ring-cyan-500/50 bg-zinc-900/90 border-cyan-500' : ''
        } space-y-3 min-h-[140px] md:min-h-[550px] flex flex-col shadow-inner`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
            {col.label}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {colTasks.length}
          </Badge>
        </div>
        <button
          onClick={() => onAddNew(col.key)}
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          title={`Add task to ${col.label}`}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} />
        </button>
      </div>

      {/* Sortable Column List */}
      <SortableContext
        items={colTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 min-h-[100px] md:min-h-[450px]">
          {colTasks.length > 0 ? (
            colTasks.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                onOpenDetail={() => onOpenDetail(task)}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="h-full min-h-[100px] md:min-h-[200px] flex flex-col items-center justify-center p-4 sm:p-6 border border-dashed border-zinc-800/80 rounded text-center space-y-1.5">
              <HugeiconsIcon icon={Tag01Icon} size={18} className="text-zinc-600" />
              <p className="text-zinc-500 text-[11px] font-mono">No tasks in {col.label.toLowerCase()}</p>
              <p className="text-zinc-600 text-[10px]">Drag tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const TasksListPage: React.FC = () => {
  // Filters & State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState<'all' | 'today' | 'this_week' | 'overdue' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at' | 'priority' | 'progress' | 'status' | 'module' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Multi-Selection State
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modals & Drawers State
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskToDetail, setTaskToDetail] = useState<TaskItem | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('todo');

  // Drag & Drop State
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [boardState, setBoardState] = useState<Record<TaskStatus, TaskItem[]> | null>(null);

  // Sensors for DndKit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Queries
  const { data: projectsResult } = useProjects({ limit: 100 });
  const projects = (projectsResult as any)?.projects || [];

  const { data: stats, isLoading: isLoadingStats } = useTaskStatistics(selectedProjectId);
  const { data: availableModules = [] } = useTaskModules(selectedProjectId);

  const filterOptions = useMemo(() => ({
    projectId: selectedProjectId,
    search: debouncedSearch,
    status: selectedStatus,
    priority: selectedPriority,
    module: selectedModule,
    dueDateFilter: selectedDueDateFilter,
    sortBy,
    sortOrder,
    limit: 100, // Fetch up to 100 for table/kanban
  }), [selectedProjectId, debouncedSearch, selectedStatus, selectedPriority, selectedModule, selectedDueDateFilter, sortBy, sortOrder]);

  const { data: tasksResult, isLoading: isLoadingTasks } = useTasks(filterOptions);
  const tasks = tasksResult?.tasks || [];

  // Realtime subscription for tasks table
  useRealtimeSubscription({
    table: 'tasks',
    queryKeyToInvalidate: ['tasks'],
  });

  // Mutations
  const updateTaskMutation = useUpdateTask();
  const bulkUpdateMutation = useBulkUpdateTasks();
  const deleteTaskMutation = useDeleteTask();
  const bulkDeleteMutation = useBulkDeleteTasks();
  const createTaskMutation = useCreateTask();
  const moveTaskMutation = useMoveTask();

  // Tasks grouped by column key for Kanban view
  const tasksByColumnFromData = useMemo(() => {
    const map: Record<TaskStatus, TaskItem[]> = {
      todo: [],
      in_progress: [],
      review: [],
      testing: [],
      completed: [],
    };

    tasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map.todo.push(t);
      }
    });

    Object.keys(map).forEach((col) => {
      map[col as TaskStatus].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    });

    return map;
  }, [tasks]);

  const tasksByColumn = boardState || tasksByColumnFromData;

  const findColumnForTask = useCallback((taskId: string, columns: Record<TaskStatus, TaskItem[]>): TaskStatus | null => {
    for (const [status, items] of Object.entries(columns)) {
      if (items.some((t) => t.id === taskId)) {
        return status as TaskStatus;
      }
    }
    return null;
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const found = tasks.find((t) => t.id === active.id);
    if (found) {
      setActiveTask(found);
      setBoardState(JSON.parse(JSON.stringify(tasksByColumnFromData)));
    }
  }, [tasks, tasksByColumnFromData]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !boardState) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnForTask(activeId, boardState);
    if (!sourceColumn) return;

    let destColumn: TaskStatus | null = null;
    let destIndex = -1;

    const columnKeys: TaskStatus[] = ['todo', 'in_progress', 'review', 'testing', 'completed'];

    if (columnKeys.includes(overId as TaskStatus)) {
      destColumn = overId as TaskStatus;
      destIndex = boardState[destColumn].length;
    } else {
      destColumn = findColumnForTask(overId, boardState);
      if (destColumn) {
        destIndex = boardState[destColumn].findIndex((t) => t.id === overId);
      }
    }

    if (!destColumn || sourceColumn === destColumn) return;

    setBoardState((prev) => {
      if (!prev) return prev;
      const newState = { ...prev };

      const sourceItems = [...prev[sourceColumn]];
      const activeIndex = sourceItems.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;
      const [movedTask] = sourceItems.splice(activeIndex, 1);

      const destItems = [...prev[destColumn!]];
      const insertAt = destIndex >= 0 ? destIndex : destItems.length;
      destItems.splice(insertAt, 0, { ...movedTask, status: destColumn! });

      newState[sourceColumn] = sourceItems;
      newState[destColumn!] = destItems;

      return newState;
    });
  }, [boardState, findColumnForTask]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      setBoardState(null);
      return;
    }

    const activeId = String(active.id);
    const currentBoard = boardState || tasksByColumnFromData;
    const targetColumn = findColumnForTask(activeId, currentBoard);

    if (!targetColumn) {
      setBoardState(null);
      return;
    }

    const targetColumnItems = currentBoard[targetColumn];
    const targetIndex = targetColumnItems.findIndex((t) => t.id === activeId);
    const newSortOrder = (targetIndex + 1) * 10;

    setBoardState(null);

    const originalTask = tasks.find((t) => t.id === activeId);
    if (originalTask && originalTask.status === targetColumn && originalTask.sort_order === newSortOrder) {
      return;
    }

    await moveTaskMutation.mutateAsync({
      taskId: activeId,
      newStatus: targetColumn,
      newSortOrder,
    });
  }, [boardState, tasksByColumnFromData, findColumnForTask, moveTaskMutation, tasks]);

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setBoardState(null);
  }, []);

  // Dropdown options
  const projectSelectOptions = useMemo(() => [
    { label: 'All Projects', value: 'all' },
    ...projects.map((p: any) => ({ value: p.id, label: p.name })),
  ], [projects]);

  const moduleSelectOptions = useMemo(() => [
    { label: 'All Modules', value: 'all' },
    ...availableModules.map((m) => ({ value: m, label: m })),
  ], [availableModules]);

  // Select all table rows toggle
  const isAllSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Quick Inline Status Update
  const handleInlineStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const newProgress = newStatus === 'completed' ? 100 : undefined;
    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates: {
        status: newStatus,
        ...(newProgress !== undefined ? { progress: newProgress } : {}),
      },
    });
  };

  // Quick Inline Priority Update
  const handleInlinePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates: { priority: newPriority },
    });
  };

  // Quick Inline Progress Change
  const handleInlineProgressChange = async (taskId: string, progressVal: number) => {
    const newStatus = progressVal === 100 ? 'completed' : undefined;
    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates: {
        progress: progressVal,
        ...(newStatus ? { status: newStatus } : {}),
      },
    });
  };

  // Quick Inline Due Date Update
  const handleInlineDueDateChange = async (taskId: string, dateStr: string) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates: { due_date: dateStr || null },
    });
  };

  // Task Actions
  const handleDuplicateTask = async (task: TaskItem) => {
    await createTaskMutation.mutateAsync({
      project_id: task.project_id,
      title: `${task.title} (Copy)`,
      description: task.description,
      module: task.module,
      priority: task.priority,
      status: 'todo',
      due_date: task.due_date,
      progress: 0,
      labels: task.labels,
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this internal task?')) {
      await deleteTaskMutation.mutateAsync(id);
      setSelectedTaskIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    if (selectedTaskIds.length === 0) return;
    await bulkUpdateMutation.mutateAsync({
      ids: selectedTaskIds,
      updates: {
        status: newStatus,
        ...(newStatus === 'completed' ? { progress: 100 } : {}),
      },
    });
    setSelectedTaskIds([]);
  };

  const handleBulkPriorityChange = async (newPriority: TaskPriority) => {
    if (selectedTaskIds.length === 0) return;
    await bulkUpdateMutation.mutateAsync({
      ids: selectedTaskIds,
      updates: { priority: newPriority },
    });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) {
      await bulkDeleteMutation.mutateAsync(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  // Helper formatting for due dates
  const formatRelativeDueDate = (dueDateStr?: string | null, status?: TaskStatus) => {
    if (!dueDateStr) return { text: 'No Due Date', color: 'text-zinc-500', isOverdue: false };

    const due = new Date(dueDateStr);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (status === 'completed') {
      return { text: dueDateStr, color: 'text-zinc-400', isOverdue: false };
    }

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d Overdue`, color: 'text-rose-400 font-bold', isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', color: 'text-amber-400 font-bold', isOverdue: false };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-cyan-400', isOverdue: false };
    }
    if (diffDays <= 7) {
      return { text: `${diffDays} Days Left`, color: 'text-zinc-300', isOverdue: false };
    }

    return { text: dueDateStr, color: 'text-zinc-400', isOverdue: false };
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-6 text-zinc-100 font-mono select-none pb-20">
      {/* 1. Page Header */}
      <PageHeader
        title="Internal Tasks & Kanban Workspace"
        description="Administrator private development board, execution workflow tracker, and task sprint manager."
        icon={Task01Icon}
        badge="Admin Only Workspace"
        breadcrumbs={[
          { label: 'Workspace', href: '/app/dashboard' },
          { label: 'Tasks & Kanban' }
        ]}
        actions={
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsFormDrawerOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0 whitespace-nowrap transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span className="hidden sm:inline">New Task</span>
          </button>
        }
      />

      {/* 2. Overview Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {isLoadingStats ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-2 animate-pulse">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-6 w-10 bg-zinc-700 rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Tasks</span>
              <div className="text-lg font-bold text-white">{stats?.total || 0}</div>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Todo</span>
              <div className="text-lg font-bold text-zinc-300">{stats?.todo || 0}</div>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-cyan-900/50 bg-cyan-950/10 space-y-1 shadow-sm">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">In Progress</span>
              <div className="text-lg font-bold text-cyan-300">{stats?.inProgress || 0}</div>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-purple-900/50 bg-purple-950/10 space-y-1 shadow-sm">
              <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">In Review</span>
              <div className="text-lg font-bold text-purple-300">{stats?.review || 0}</div>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-amber-900/50 bg-amber-950/10 space-y-1 shadow-sm">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Testing</span>
              <div className="text-lg font-bold text-amber-300">{stats?.testing || 0}</div>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-emerald-900/50 bg-emerald-950/10 space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Completed</span>
              <div className="text-lg font-bold text-emerald-300">{stats?.completed || 0}</div>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-rose-900/60 bg-rose-950/20 space-y-1 shadow-sm">
              <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <span>Overdue</span>
                {stats && stats.overdue > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
              </span>
              <div className="text-lg font-bold text-rose-300">{stats?.overdue || 0}</div>
            </div>
          </>
        )}
      </div>

      {/* 3. Interactive Toolbar */}
      <div className="p-4 rounded bg-zinc-900 border border-zinc-800 space-y-3.5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks by title or module..."
              className="w-full pl-9 pr-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
            />
          </div>

          {/* Project Filter */}
          <Select
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projectSelectOptions}
            className="w-full"
          />

          {/* Module Filter */}
          <Select
            value={selectedModule}
            onChange={setSelectedModule}
            options={moduleSelectOptions}
            className="w-full"
          />

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={STATUS_SELECT_OPTIONS}
            className="w-full"
          />

          {/* Priority Filter */}
          <Select
            value={selectedPriority}
            onChange={setSelectedPriority}
            options={PRIORITY_SELECT_OPTIONS}
            className="w-full"
          />
        </div>

        {/* Second Toolbar Row: Due Date Filter, Sort, View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-zinc-500 text-[11px] font-bold uppercase">Date:</span>
            <Select
              value={selectedDueDateFilter}
              onChange={(v) => setSelectedDueDateFilter(v as any)}
              options={DUE_DATE_SELECT_OPTIONS}
              className="w-40"
            />

            <span className="text-zinc-500 text-[11px] font-bold uppercase ml-2">Sort:</span>
            <Select
              value={sortBy}
              onChange={(v) => setSortBy(v as any)}
              options={SORT_OPTIONS}
              className="w-44"
            />

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              title={`Sort order: ${sortOrder.toUpperCase()}`}
            >
              <HugeiconsIcon icon={sortOrder === 'asc' ? ArrowUp01Icon : ArrowDown01Icon} size={14} />
            </button>
          </div>

          {/* View Mode Toggle: Table vs Kanban */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-800 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${viewMode === 'table' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <HugeiconsIcon icon={Menu01Icon} size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${viewMode === 'kanban' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <HugeiconsIcon icon={Grid02Icon} size={14} />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Task Workspace Content */}
      {isLoadingTasks ? (
        <div className="p-8 rounded bg-zinc-900 border border-zinc-800 text-center space-y-3 font-mono text-xs">
          <RadialSpinner size={24} className="mx-auto" />
          <p className="text-zinc-400">Loading task directory...</p>
        </div>
      ) : tasks.length > 0 ? (
        viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="rounded bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10.5px] font-bold tracking-wider sticky top-0 z-10 select-none">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 min-w-[240px]">Task</th>
                    <th className="p-3 w-32">Module</th>
                    <th className="p-3 w-28">Priority</th>
                    <th className="p-3 w-32">Status</th>
                    <th className="p-3 w-36">Progress</th>
                    <th className="p-3 w-32">Due Date</th>
                    <th className="p-3 min-w-[140px]">Labels</th>
                    <th className="p-3 w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {tasks.map((task) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    const dueInfo = formatRelativeDueDate(task.due_date, task.status);

                    return (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-zinc-800/40 transition-colors ${isSelected ? 'bg-zinc-800/60' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(task.id)}
                          />
                        </td>

                        {/* Task Title & Project */}
                        <td className="p-3">
                          <div className="space-y-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => setTaskToDetail(task)}
                              className="font-bold text-white hover:underline text-left text-xs leading-snug line-clamp-2 cursor-pointer"
                            >
                              {task.title}
                            </button>
                            {task.project && (
                              <div className="flex items-center gap-1 text-[10.5px] text-zinc-400">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color || '#E11D48' }} />
                                <span>{task.project.name}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Module */}
                        <td className="p-3">
                          {task.module ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10.5px] text-zinc-300">
                              {task.module}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[10.5px]">—</span>
                          )}
                        </td>

                        {/* Inline Priority Select */}
                        <td className="p-3">
                          <Select
                            value={task.priority}
                            onChange={(val) => handleInlinePriorityChange(task.id, val as TaskPriority)}
                            options={PRIORITY_SELECT_OPTIONS.filter((o) => o.value !== 'all')}
                            className="w-28"
                          />
                        </td>

                        {/* Inline Status Select */}
                        <td className="p-3">
                          <Select
                            value={task.status}
                            onChange={(val) => handleInlineStatusChange(task.id, val as TaskStatus)}
                            options={STATUS_SELECT_OPTIONS.filter((o) => o.value !== 'all')}
                            className="w-32"
                          />
                        </td>

                        {/* Inline Progress Bar & Editable Slider */}
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-bold text-zinc-300">{task.progress}%</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={task.progress}
                                onChange={(e) => handleInlineProgressChange(task.id, Number(e.target.value))}
                                className="w-10 px-1 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-right text-[10px] text-white outline-none"
                              />
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${task.progress === 100
                                    ? 'bg-emerald-400'
                                    : task.progress > 50
                                      ? 'bg-cyan-400'
                                      : 'bg-zinc-400'
                                  }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Inline Due Date Picker */}
                        <td className="p-3">
                          <DatePicker
                            value={task.due_date || ''}
                            onChange={(dateStr) => handleInlineDueDateChange(task.id, dateStr)}
                            placeholder="Set date..."
                          />
                          <span className={`text-[10px] mt-0.5 block ${dueInfo.color}`}>
                            {dueInfo.text}
                          </span>
                        </td>

                        {/* Labels Pill */}
                        <td className="p-3">
                          {task.labels && task.labels.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {task.labels.slice(0, 2).map((lbl, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                                  #{lbl}
                                </span>
                              ))}
                              {task.labels.length > 2 && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 font-bold">
                                  +{task.labels.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10.5px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setTaskToEdit(task);
                                setIsFormDrawerOpen(true);
                              }}
                              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                              title="Edit task"
                            >
                              <HugeiconsIcon icon={Edit01Icon} size={14} />
                            </button>
                            <button
                              onClick={() => handleDuplicateTask(task)}
                              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                              title="Duplicate task"
                            >
                              <HugeiconsIcon icon={Copy01Icon} size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
                              title="Delete task"
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* KANBAN BOARD VIEW */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {STATUS_COLUMNS.map((col) => (
                <TaskDroppableColumn
                  key={col.key}
                  col={col}
                  colTasks={tasksByColumn[col.key] || []}
                  onAddNew={(status) => {
                    setDefaultStatusForNew(status);
                    setTaskToEdit(null);
                    setIsFormDrawerOpen(true);
                  }}
                  onOpenDetail={(task) => setTaskToDetail(task)}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsFormDrawerOpen(true);
                  }}
                  onDuplicate={handleDuplicateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>

            {/* Elevated Drag Overlay */}
            <DragOverlay>
              {activeTask ? (
                <KanbanTaskCard
                  task={activeTask}
                  onOpenDetail={() => { }}
                  onEdit={() => { }}
                  onDuplicate={() => { }}
                  onDelete={() => { }}
                  isDraggingOverlay={true}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      ) : (
        /* EMPTY STATE */
        <div className="p-12 rounded bg-zinc-900 border border-zinc-800 text-center space-y-3 font-mono text-xs shadow-xl">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <HugeiconsIcon icon={Task01Icon} size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Development Tasks Found</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {debouncedSearch || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedModule !== 'all'
                ? 'No internal tasks match your selected filter criteria. Try clearing search or filters.'
                : 'Your development workspace is empty. Create your first internal task to begin tracking execution.'}
            </p>
          </div>
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsFormDrawerOpen(true);
            }}
            className="px-4 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} />
            <span>Create First Task</span>
          </button>
        </div>
      )}

      {/* 5. Floating Multi-Selection Bulk Actions Toolbar */}
      {selectedTaskIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-3 rounded-sm bg-zinc-950 border border-zinc-700 shadow-2xl flex items-center gap-3 text-xs font-mono text-white"
        >
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold">{selectedTaskIds.length} Tasks Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value="all"
              onChange={(val) => val !== 'all' && handleBulkStatusChange(val as TaskStatus)}
              options={STATUS_SELECT_OPTIONS}
              placeholder="Bulk Set Status..."
              className="w-36"
            />

            <Select
              value="all"
              onChange={(val) => val !== 'all' && handleBulkPriorityChange(val as TaskPriority)}
              options={PRIORITY_SELECT_OPTIONS}
              placeholder="Bulk Set Priority..."
              className="w-36"
            />

            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              <span>Delete Selected</span>
            </button>

            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white text-xs cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </motion.div>
      )}

      {/* Form Drawer Modal */}
      <TaskFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForNew}
      />

      {/* Task Detail Workspace Drawer */}
      <TaskDetailDrawer
        taskId={taskToDetail?.id || null}
        isOpen={!!taskToDetail}
        onClose={() => setTaskToDetail(null)}
      />
    </div>
  );
};

export default TasksListPage;
