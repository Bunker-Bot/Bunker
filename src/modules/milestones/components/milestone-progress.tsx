import React from 'react';
import { motion } from 'framer-motion';

interface MilestoneProgressProps {
  progress: number;
  tasksCount?: number;
  completedTasksCount?: number;
  status?: string;
  showLabels?: boolean;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  progress,
  tasksCount = 0,
  completedTasksCount = 0,
  status = 'in_progress',
  showLabels = true,
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const isCompleted = status === 'completed' || normalizedProgress >= 100;

  return (
    <div className="space-y-1.5 font-mono">
      {showLabels && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 font-sans font-medium flex items-center gap-1.5">
            Progress Status
            {tasksCount > 0 && (
              <span className="text-[10px] text-zinc-500 font-mono">
                ({completedTasksCount} / {tasksCount} Tasks)
              </span>
            )}
          </span>
          <span
            className={`font-bold ${
              isCompleted
                ? 'text-emerald-400'
                : normalizedProgress > 50
                ? 'text-cyan-400'
                : 'text-amber-300'
            }`}
          >
            {normalizedProgress}%
          </span>
        </div>
      )}

      {/* Progress Bar Track */}
      <div className="relative w-full h-2.5 bg-zinc-950 rounded-sm overflow-hidden border border-zinc-800 p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-sm ${
            isCompleted
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : normalizedProgress > 50
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-400'
          }`}
        />
      </div>
    </div>
  );
};

export default MilestoneProgress;
