import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
  Clock01Icon,
  AlertCircleIcon,
  Calendar01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Edit02Icon,
  Delete02Icon,
  Copy01Icon,
  ArrowUp02Icon,
  ArrowDown02Icon,
  Doc01Icon,
  Flag01Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { MarkdownPreview } from '../../projects/components/MarkdownPreview';
import type { Milestone } from '../../../types';
import { MilestoneProgress } from './milestone-progress';
import { MilestoneMetadata } from './milestone-metadata';
import { MilestoneDeliverables } from './milestone-deliverables';
import { MilestoneAttachments } from './milestone-attachments';
import { MilestoneDependencies } from './milestone-dependencies';

interface MilestoneCardProps {
  milestone: Milestone;
  readonly?: boolean;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestoneId: string) => void;
  onToggleComplete?: (milestoneId: string, currentStatus: string) => void;
  onDuplicate?: (milestone: Milestone) => void;
  onMoveUp?: (milestoneId: string) => void;
  onMoveDown?: (milestoneId: string) => void;
  onAddAttachment?: (milestoneId: string, fileName: string, fileUrl: string) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  readonly = false,
  onEdit,
  onDelete,
  onToggleComplete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = milestone.name || milestone.title || 'Untitled Milestone';
  const description = milestone.description || milestone.notes || '';
  const progress = milestone.progress || 0;
  const isCompleted = milestone.status === 'completed' || progress >= 100;
  const startDate = milestone.start_date || milestone.startDate;
  const dueDate = milestone.due_date || milestone.dueDate;
  const completionDate = milestone.completion_date || milestone.completionDate;

  // Overdue calculation
  const now = new Date();
  const isOverdue =
    !isCompleted && dueDate && new Date(dueDate) < now;

  let daysOverdue = 0;
  if (isOverdue && dueDate) {
    const diffTime = Math.abs(now.getTime() - new Date(dueDate).getTime());
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Upcoming countdown
  let daysUntilDue = 0;
  const isUpcoming = !isCompleted && !isOverdue && dueDate;
  if (isUpcoming && dueDate) {
    const diffTime = new Date(dueDate).getTime() - now.getTime();
    daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Estimated Duration
  let durationDays = 0;
  if (startDate && dueDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(dueDate).getTime();
    durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }

  const priority = milestone.priority || 'medium';
  const priorityColor =
    priority === 'urgent'
      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
      : priority === 'high'
      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
      : priority === 'medium'
      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
      : 'bg-zinc-900 text-zinc-400 border-zinc-800';

  const statusBadge = isCompleted ? (
    <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] uppercase font-bold flex items-center gap-1">
      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
      <span>COMPLETED</span>
    </Badge>
  ) : isOverdue ? (
    <Badge variant="outline" className="rounded-sm bg-rose-950/80 text-rose-300 border-rose-800 text-[10px] uppercase font-bold flex items-center gap-1">
      <HugeiconsIcon icon={AlertCircleIcon} size={12} />
      <span>OVERDUE ({daysOverdue}D LATE)</span>
    </Badge>
  ) : progress > 0 ? (
    <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] uppercase font-bold flex items-center gap-1">
      <HugeiconsIcon icon={Loading03Icon} size={12} className="animate-spin text-cyan-400" />
      <span>IN PROGRESS</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="rounded-sm bg-zinc-900 text-zinc-400 border-zinc-800 text-[10px] uppercase font-bold flex items-center gap-1">
      <HugeiconsIcon icon={Clock01Icon} size={12} />
      <span>PENDING</span>
    </Badge>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-sm border transition-all select-none overflow-hidden ${
        isCompleted
          ? 'bg-zinc-950/90 border-emerald-900/40 hover:border-emerald-700/60'
          : isOverdue
          ? 'bg-zinc-950/90 border-rose-900/50 hover:border-rose-700/70'
          : 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Card Top Main Header */}
      <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Status Icon */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              disabled={readonly}
              onClick={() => onToggleComplete && onToggleComplete(milestone.id, milestone.status)}
              className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 border transition-all ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-105'
              } ${
                isCompleted
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400 shadow-md'
                  : isOverdue
                  ? 'bg-rose-950/80 border-rose-800 text-rose-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title={isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            >
              <HugeiconsIcon
                icon={isCompleted ? CheckmarkCircle02Icon : isOverdue ? AlertCircleIcon : Flag01Icon}
                size={18}
              />
            </button>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  {title}
                </h3>
                {statusBadge}
                <Badge variant="outline" className={`rounded-sm text-[9px] uppercase font-bold ${priorityColor}`}>
                  {priority}
                </Badge>
              </div>

              {/* Countdown or Duration Tag */}
              <div className="flex items-center gap-3 text-[11px] font-sans text-zinc-400">
                {isUpcoming && daysUntilDue > 0 && (
                  <span className="text-cyan-400 font-mono font-bold">
                    ⏳ Due in {daysUntilDue} Days
                  </span>
                )}
                {durationDays > 0 && (
                  <span className="text-zinc-500 font-mono">
                    Estimated: {durationDays} Days
                  </span>
                )}
                {milestone.sprint && (
                  <span className="text-zinc-500 font-mono">
                    Target: {milestone.sprint}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 self-end sm:self-center flex-wrap justify-end">
            {!readonly && (
              <>
                {onMoveUp && (
                  <button
                    onClick={() => onMoveUp(milestone.id)}
                    className="p-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    title="Move Up"
                  >
                    <HugeiconsIcon icon={ArrowUp02Icon} size={14} />
                  </button>
                )}
                {onMoveDown && (
                  <button
                    onClick={() => onMoveDown(milestone.id)}
                    className="p-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    title="Move Down"
                  >
                    <HugeiconsIcon icon={ArrowDown02Icon} size={14} />
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => onDuplicate(milestone)}
                    className="p-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    title="Duplicate Milestone"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={14} />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(milestone)}
                    className="p-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    title="Edit Milestone"
                  >
                    <HugeiconsIcon icon={Edit02Icon} size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(milestone.id)}
                    className="p-1.5 rounded-sm bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 cursor-pointer transition-colors"
                    title="Delete Milestone"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </button>
                )}
              </>
            )}

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{isExpanded ? 'Collapse' : 'Details'}</span>
              <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={13} />
            </button>
          </div>
        </div>

        {/* Timeline Dates Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-sm bg-zinc-900/60 border border-zinc-850 text-[10px] sm:text-[11px] font-mono">
          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
              <HugeiconsIcon icon={Calendar01Icon} size={10} />
              Started
            </span>
            <strong className="text-zinc-300 block">{startDate ? new Date(startDate).toLocaleDateString() : '—'}</strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
              <HugeiconsIcon icon={Clock01Icon} size={10} />
              Target Due
            </span>
            <strong className={isOverdue ? 'text-rose-400 font-bold block' : 'text-zinc-300 block'}>
              {dueDate ? new Date(dueDate).toLocaleDateString() : '—'}
            </strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} />
              Completed
            </span>
            <strong className={isCompleted ? 'text-emerald-400 font-bold block' : 'text-zinc-500 block'}>
              {completionDate ? new Date(completionDate).toLocaleDateString() : '—'}
            </strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
              <HugeiconsIcon icon={Doc01Icon} size={10} />
              Tasks Checklist
            </span>
            <strong className="text-cyan-400 font-bold block">
              {milestone.completed_tasks_count ?? milestone.completedTasksCount ?? 0} /{' '}
              {milestone.tasks_count ?? milestone.tasksCount ?? 0} Tasks
            </strong>
          </div>
        </div>

        {/* Progress Bar */}
        <MilestoneProgress
          progress={progress}
          tasksCount={milestone.tasks_count ?? milestone.tasksCount ?? 0}
          completedTasksCount={milestone.completed_tasks_count ?? milestone.completedTasksCount ?? 0}
          status={milestone.status}
        />
      </div>

      {/* Expandable Content Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-zinc-800 bg-zinc-950/60 p-4 sm:p-5 space-y-5"
          >
            {/* Description Markdown */}
            {description && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block font-mono">
                  Scope & Technical Description
                </span>
                <div className="p-3.5 rounded-sm bg-zinc-900/80 border border-zinc-850 text-zinc-300 text-xs leading-relaxed font-sans">
                  <MarkdownPreview content={description} />
                </div>
              </div>
            )}

            {/* Metadata Component */}
            <MilestoneMetadata milestone={milestone} />

            {/* Dependencies */}
            <MilestoneDependencies
              dependencies={milestone.dependencies}
              isBlocked={Boolean(isOverdue)}
            />

            {/* Deliverables Checklist */}
            <MilestoneDeliverables
              deliverables={milestone.deliverables}
              readonly={readonly}
            />

            {/* Attachments */}
            <MilestoneAttachments
              milestoneId={milestone.id}
              attachments={milestone.attachments}
              readonly={readonly}
              onAddAttachment={(fName, fUrl) =>
                onAddAttachment && onAddAttachment(milestone.id, fName, fUrl)
              }
              onDeleteAttachment={onDeleteAttachment}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MilestoneCard;
