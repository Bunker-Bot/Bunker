import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  useMoveTask,
  useDeleteTask,
  useCreateTask
} from '../../lib/supabase/queries/tasks';
import { useProjects } from '../../lib/supabase/queries/projects';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import type { TaskItem, TaskStatus } from '../../lib/repositories/task.repository';
import { TaskFormDrawer } from '../tasks/task-form-drawer';
import { TaskDetailDrawer } from '../tasks/task-detail-drawer';
import { KanbanTaskCard } from './task-card';
import { PageHeader } from '../../../packages/ui/src/components/page-header';
import { Select } from '../../../packages/ui/src/components/select';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { Badge } from '../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Grid02Icon,
  PlusSignIcon,
  Search01Icon,
  Tag01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon
} from '@hugeicons/core-free-icons';

const KANBAN_COLUMNS: { key: TaskStatus; label: string; bg: string; border: string; color: string }[] = [
  { key: 'todo', label: 'Todo', bg: 'bg-zinc-950/60', border: 'border-zinc-800', color: 'text-zinc-400' },
  { key: 'in_progress', label: 'In Progress', bg: 'bg-cyan-950/20', border: 'border-cyan-900/50', color: 'text-cyan-400' },
  { key: 'review', label: 'In Review', bg: 'bg-purple-950/20', border: 'border-purple-900/50', color: 'text-purple-400' },
  { key: 'testing', label: 'Testing', bg: 'bg-amber-950/20', border: 'border-amber-900/50', color: 'text-amber-400' },
  { key: 'completed', label: 'Completed', bg: 'bg-emerald-950/20', border: 'border-emerald-900/50', color: 'text-emerald-400' },
];

const PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const DUE_DATE_OPTIONS = [
  { label: 'All Due Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Upcoming', value: 'upcoming' },
];

const SORT_OPTIONS = [
  { label: 'Sort: Position / Order', value: 'sort_order' },
  { label: 'Sort: Created Date', value: 'created_at' },
  { label: 'Sort: Due Date', value: 'due_date' },
  { label: 'Sort: Priority', value: 'priority' },
  { label: 'Sort: Progress', value: 'progress' },
];

/* Droppable Column Component */
const KanbanDroppableColumn: React.FC<{
  col: typeof KANBAN_COLUMNS[number];
  colTasks: TaskItem[];
  tasks: TaskItem[];
  onAddNew: (status: TaskStatus) => void;
  onOpenDetail: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDuplicate: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}> = ({ col, colTasks, onAddNew, onOpenDetail, onEdit, onDuplicate, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      id={col.key}
      className={`p-3.5 rounded border transition-colors ${col.border} ${col.bg} ${
        isOver ? 'ring-2 ring-cyan-500/50 bg-zinc-900/90 border-cyan-500' : ''
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
                onOpenDetail={onOpenDetail}
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

export const KanbanBoard: React.FC = () => {
  // State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState<'all' | 'today' | 'this_week' | 'overdue' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'sort_order' | 'created_at' | 'due_date' | 'priority' | 'progress'>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals & Drawers
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskToDetail, setTaskToDetail] = useState<TaskItem | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('todo');

  // Drag Overlay Active Task
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  // Sensors for DndKit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // Debounce search (300ms)
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
    priority: selectedPriority,
    module: selectedModule,
    dueDateFilter: selectedDueDateFilter,
    sortBy,
    sortOrder,
    limit: 150,
  }), [selectedProjectId, debouncedSearch, selectedPriority, selectedModule, selectedDueDateFilter, sortBy, sortOrder]);

  const { data: tasksResult, isLoading: isLoadingTasks } = useTasks(filterOptions);
  const tasks = tasksResult?.tasks || [];

  // Live Subscription
  useRealtimeSubscription({
    table: 'tasks',
    queryKeyToInvalidate: ['tasks'],
  });

  // Mutations
  const moveTaskMutation = useMoveTask();
  const deleteTaskMutation = useDeleteTask();
  const createTaskMutation = useCreateTask();

  // Dropdown options
  const projectSelectOptions = useMemo(() => [
    { label: 'All Projects', value: 'all' },
    ...projects.map((p: any) => ({ value: p.id, label: p.name })),
  ], [projects]);

  const moduleSelectOptions = useMemo(() => [
    { label: 'All Modules', value: 'all' },
    ...availableModules.map((m) => ({ value: m, label: m })),
  ], [availableModules]);

  // Local board state — tracks card positions during drag for real-time visual feedback
  const [boardState, setBoardState] = useState<Record<TaskStatus, TaskItem[]> | null>(null);

  // Tasks grouped by column key (source of truth when not dragging)
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

    // Sort items within each column by sort_order
    Object.keys(map).forEach((col) => {
      map[col as TaskStatus].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    });

    return map;
  }, [tasks]);

  // Active board state: use local board state during drag, otherwise use data
  const tasksByColumn = boardState || tasksByColumnFromData;

  // Helper: find which column a task ID belongs to in the current board state
  const findColumnForTask = useCallback((taskId: string, columns: Record<TaskStatus, TaskItem[]>): TaskStatus | null => {
    for (const [status, items] of Object.entries(columns)) {
      if (items.some((t) => t.id === taskId)) {
        return status as TaskStatus;
      }
    }
    return null;
  }, []);

  // Drag Events Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const found = tasks.find((t) => t.id === active.id);
    if (found) {
      setActiveTask(found);
      // Snapshot the current board state for real-time drag updates
      setBoardState(JSON.parse(JSON.stringify(tasksByColumnFromData)));
    }
  }, [tasks, tasksByColumnFromData]);

  // onDragOver: fires when dragging over a different container — moves card between columns in real-time
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !boardState) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnForTask(activeId, boardState);
    if (!sourceColumn) return;

    // Determine destination column
    let destColumn: TaskStatus | null = null;
    let destIndex = -1;

    const columnKeys: TaskStatus[] = ['todo', 'in_progress', 'review', 'testing', 'completed'];

    if (columnKeys.includes(overId as TaskStatus)) {
      // Dropping directly over a column droppable
      destColumn = overId as TaskStatus;
      destIndex = boardState[destColumn].length; // append at end
    } else {
      // Dropping over a card — find which column that card is in
      destColumn = findColumnForTask(overId, boardState);
      if (destColumn) {
        destIndex = boardState[destColumn].findIndex((t) => t.id === overId);
      }
    }

    if (!destColumn) return;

    // If same column, no need to move during dragOver (sortable handles reordering within column)
    if (sourceColumn === destColumn) return;

    // Move the task from source to destination column
    setBoardState((prev) => {
      if (!prev) return prev;
      const newState = { ...prev };

      // Remove from source
      const sourceItems = [...prev[sourceColumn]];
      const activeIndex = sourceItems.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;
      const [movedTask] = sourceItems.splice(activeIndex, 1);

      // Insert into destination
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
      // Cancelled drag — reset board state
      setBoardState(null);
      return;
    }

    const activeId = String(active.id);

    // Use the current board state to determine final position
    const currentBoard = boardState || tasksByColumnFromData;
    const targetColumn = findColumnForTask(activeId, currentBoard);

    if (!targetColumn) {
      setBoardState(null);
      return;
    }

    const targetColumnItems = currentBoard[targetColumn];
    const targetIndex = targetColumnItems.findIndex((t) => t.id === activeId);
    const newSortOrder = (targetIndex + 1) * 10;

    // Reset local board state
    setBoardState(null);

    // Check if anything actually changed
    const originalTask = tasks.find((t) => t.id === activeId);
    if (originalTask && originalTask.status === targetColumn && originalTask.sort_order === newSortOrder) {
      return; // No change
    }

    // Execute single batch mutation
    await moveTaskMutation.mutateAsync({
      taskId: activeId,
      newStatus: targetColumn,
      newSortOrder,
    });
  }, [boardState, tasksByColumnFromData, findColumnForTask, moveTaskMutation, tasks]);

  // Cancel drag on escape — cleanup local state
  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setBoardState(null);
  }, []);

  const handleDuplicateTask = async (task: TaskItem) => {
    await createTaskMutation.mutateAsync({
      project_id: task.project_id,
      title: `${task.title} (Copy)`,
      description: task.description,
      module: task.module,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
      progress: 0,
      labels: task.labels,
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTaskMutation.mutateAsync(id);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 text-zinc-100 font-mono select-none pb-20">
      {/* 1. Shared PageHeader */}
      <PageHeader
        title="Sprint Execution Board"
        description="Private administrator Kanban board, status column reordering, and task workflow manager."
        icon={Grid02Icon}
        badge="Linear-Style Kanban"
        breadcrumbs={[
          { label: 'Workspace', href: '/app/dashboard' },
          { label: 'Kanban Board' }
        ]}
        actions={
          <button
            onClick={() => {
              setDefaultStatusForNew('todo');
              setTaskToEdit(null);
              setIsFormDrawerOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0 whitespace-nowrap transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>New Task</span>
          </button>
        }
      />

      {/* 2. Overview Statistics Cards Row */}
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

      {/* 3. Board Control Toolbar */}
      <div className="p-4 rounded bg-zinc-900 border border-zinc-800 space-y-3.5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search board tasks by title or module..."
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

          {/* Priority Filter */}
          <Select
            value={selectedPriority}
            onChange={setSelectedPriority}
            options={PRIORITY_OPTIONS}
            className="w-full"
          />
        </div>

        {/* Second Row Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 text-[11px] font-bold uppercase">Due Date:</span>
            <Select
              value={selectedDueDateFilter}
              onChange={(v) => setSelectedDueDateFilter(v as any)}
              options={DUE_DATE_OPTIONS}
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

          <div className="text-zinc-400 text-[11px] font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Drag cards to reorder status live</span>
          </div>
        </div>
      </div>

      {/* 4. DndKit Drag & Drop Kanban Board */}
      {isLoadingTasks ? (
        <div className="p-12 rounded bg-zinc-900 border border-zinc-800 text-center space-y-3 font-mono text-xs">
          <RadialSpinner size={24} className="mx-auto" />
          <p className="text-zinc-400">Loading Kanban execution board...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {KANBAN_COLUMNS.map((col) => (
              <KanbanDroppableColumn
                key={col.key}
                col={col}
                colTasks={tasksByColumn[col.key] || []}
                tasks={tasks}
                onAddNew={(status) => {
                  setDefaultStatusForNew(status);
                  setTaskToEdit(null);
                  setIsFormDrawerOpen(true);
                }}
                onOpenDetail={(id) => {
                  const found = tasks.find((t) => t.id === id);
                  if (found) setTaskToDetail(found);
                }}
                onEdit={(t) => {
                  setTaskToEdit(t);
                  setIsFormDrawerOpen(true);
                }}
                onDuplicate={handleDuplicateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          {/* Elevated Glass Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <KanbanTaskCard
                task={activeTask}
                onOpenDetail={() => {}}
                onEdit={() => {}}
                onDuplicate={() => {}}
                onDelete={() => {}}
                isDraggingOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Form Drawer */}
      <TaskFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForNew}
      />

      {/* Task Detail Drawer Workspace */}
      <TaskDetailDrawer
        taskId={taskToDetail?.id || null}
        isOpen={!!taskToDetail}
        onClose={() => setTaskToDetail(null)}
      />
    </div>
  );
};

export default KanbanBoard;
