import React from 'react';
import { motion } from 'framer-motion';
import { MilestoneCard } from './milestone-card';
import type { Milestone } from '../../../types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  readonly?: boolean;
  viewMode?: 'timeline' | 'cards';
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestoneId: string) => void;
  onToggleComplete?: (milestoneId: string, currentStatus: string) => void;
  onDuplicate?: (milestone: Milestone) => void;
  onMoveUp?: (milestoneId: string) => void;
  onMoveDown?: (milestoneId: string) => void;
  onAddAttachment?: (milestoneId: string, fileName: string, fileUrl: string) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  readonly = false,
  viewMode = 'timeline',
  onEdit,
  onDelete,
  onToggleComplete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            readonly={readonly}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            onDuplicate={onDuplicate}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onAddAttachment={onAddAttachment}
            onDeleteAttachment={onDeleteAttachment}
          />
        ))}
      </div>
    );
  }

  // Vertical Stepper Timeline View
  return (
    <div className="relative pl-6 sm:pl-8 md:pl-10 space-y-4 sm:space-y-6">
      {/* Vertical Continuous Connector Line */}
      <div className="absolute left-[11px] sm:left-[15px] md:left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/80 via-emerald-500/50 to-zinc-800 pointer-events-none" />

      {milestones.map((milestone, idx) => {
        const isCompleted = milestone.status === 'completed' || (milestone.progress || 0) >= 100;

        return (
          <div key={milestone.id} className="relative group">
            {/* Animated Stepper Dot Badge */}
            <div className="absolute -left-[23px] sm:-left-[29px] md:-left-[33px] top-4 z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-bold shadow-lg ${
                  isCompleted
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : (milestone.progress || 0) > 0
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-400 animate-pulse'
                    : 'bg-zinc-950 border-zinc-700 text-zinc-500'
                }`}
              >
                {idx + 1}
              </motion.div>
            </div>

            {/* Milestone Card Container */}
            <MilestoneCard
              milestone={milestone}
              readonly={readonly}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onDuplicate={onDuplicate}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onAddAttachment={onAddAttachment}
              onDeleteAttachment={onDeleteAttachment}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneTimeline;
