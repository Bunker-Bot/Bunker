import React, { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskItem, TaskPriority, TaskStatus } from '../../lib/repositories/task.repository';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../../packages/ui/src/components/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Edit01Icon,
  Delete02Icon,
  Copy01Icon,
  Tag01Icon,
  AttachmentIcon,
  ViewIcon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';

export interface TaskCardProps {
  task: TaskItem;
  onOpenDetail: (taskId: string) => void;
  onEdit: (task: TaskItem) => void;
  onDuplicate: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
  isDraggingOverlay?: boolean;
}

// Relative Due Date Formatting Helper
export const formatRelativeDueDate = (dueDateStr?: string | null, status?: TaskStatus) => {
  if (!dueDateStr) return null;

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

// Priority Badge Component
export const PriorityBadge: React.FC<{ priority: TaskPriority }> = memo(({ priority }) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive" className="bg-rose-950/90 border-rose-800 text-rose-300 text-[10px] uppercase tracking-wider font-bold">Urgent</Badge>;
    case 'high':
      return <Badge variant="secondary" className="bg-amber-950/90 border-amber-800 text-amber-300 text-[10px] uppercase tracking-wider font-bold">High</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="bg-zinc-800 border-zinc-700 text-zinc-300 text-[10px] uppercase tracking-wider font-bold">Medium</Badge>;
    case 'low':
    default:
      return <Badge variant="outline" className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold">Low</Badge>;
  }
});
PriorityBadge.displayName = 'PriorityBadge';

// Relative Time Formatter
export const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

export const KanbanTaskCard: React.FC<TaskCardProps> = memo(({
  task,
  onOpenDetail,
  onEdit,
  onDuplicate,
  onDelete,
  isDraggingOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isDraggingOverlay });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 0 : 'auto',
  }), [transform, transition, isDragging]);

  const dueInfo = useMemo(() => formatRelativeDueDate(task.due_date, task.status), [task.due_date, task.status]);
  const relativeUpdated = useMemo(() => formatRelativeTime(task.updated_at || task.created_at), [task.updated_at, task.created_at]);

  const visibleLabels = useMemo(() => task.labels?.slice(0, 3) || [], [task.labels]);
  const overflowLabelsCount = useMemo(() => Math.max(0, (task.labels?.length || 0) - 3), [task.labels]);

  const attachmentCount = (task as any).attachment_count || (task as any).attachments?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Don't open detail if we were dragging
        if (isDragging) return;
        e.stopPropagation();
        onOpenDetail(task.id);
      }}
      className={`p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700/90 hover:bg-zinc-900 transition-all space-y-2.5 shadow-md group relative font-mono select-none cursor-pointer touch-none ${
        isDraggingOverlay ? 'shadow-2xl backdrop-blur-md border-zinc-600 rotate-1 scale-105 z-50' : ''
      } ${isDragging ? 'opacity-25' : ''}`}
    >
      {/* 1. Header: Title & Priority Badge & Quick Action Menu */}
      <div className="flex items-start justify-between gap-2">
        <h4
          className="font-bold text-white text-xs leading-snug line-clamp-2 hover:text-zinc-200 transition-colors flex-1"
          title={task.title}
        >
          {task.title}
        </h4>
        <div className="shrink-0 flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* 2. Metadata: Project Color Dot & Module Pill */}
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 flex-wrap">
        {task.project && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800/80 text-zinc-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: task.project.color || '#E11D48' }} />
            <span className="truncate max-w-[120px]">{task.project.name}</span>
          </span>
        )}
        {task.module && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800/80 text-zinc-400 font-mono">
            <HugeiconsIcon icon={Tag01Icon} size={10} className="text-zinc-500 shrink-0" />
            <span className="truncate max-w-[100px]">{task.module}</span>
          </span>
        )}
      </div>

      {/* 3. Progress Bar & Live Percentage */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>Progress</span>
          <span className="font-bold text-white font-mono">{task.progress}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              task.progress === 100 ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* 4. Labels & Due Date Tags */}
      {(dueInfo || visibleLabels.length > 0) && (
        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5 text-[10px]">
          {dueInfo ? (
            <span className={`inline-flex items-center gap-1 ${dueInfo.color}`} title={task.due_date || ''}>
              {dueInfo.isOverdue && <HugeiconsIcon icon={AlertCircleIcon} size={11} className="text-rose-400" />}
              <span>{dueInfo.text}</span>
            </span>
          ) : (
            <span />
          )}

          {visibleLabels.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {visibleLabels.map((lbl, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                  #{lbl}
                </span>
              ))}
              {overflowLabelsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-500 font-bold font-mono">
                  +{overflowLabelsCount}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Footer: Last Updated & Attachments & Hover Action Buttons */}
      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-2">
          <span>Updated {relativeUpdated}</span>
          {attachmentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-zinc-400 font-bold" title={`${attachmentCount} attachments`}>
              <HugeiconsIcon icon={AttachmentIcon} size={11} />
              <span>{attachmentCount}</span>
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(task.id);
            }}
            className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Inspect Task Details"
          >
            <HugeiconsIcon icon={ViewIcon} size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Edit Task"
          >
            <HugeiconsIcon icon={Edit01Icon} size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(task);
            }}
            className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Duplicate Task"
          >
            <HugeiconsIcon icon={Copy01Icon} size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 rounded-sm text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
            title="Delete Task"
          >
            <HugeiconsIcon icon={Delete02Icon} size={12} />
          </button>
        </div>
      </div>
    </div>
  );
});

KanbanTaskCard.displayName = 'KanbanTaskCard';

/* Skeleton Loading State for TaskCard */
export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="p-3.5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 font-mono">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-3/4 bg-zinc-800" />
        <Skeleton className="h-4 w-12 bg-zinc-800" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16 bg-zinc-800" />
        <Skeleton className="h-3 w-12 bg-zinc-800" />
      </div>
      <Skeleton className="h-1.5 w-full bg-zinc-800" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-20 bg-zinc-800" />
        <Skeleton className="h-3 w-10 bg-zinc-800" />
      </div>
    </div>
  );
};
