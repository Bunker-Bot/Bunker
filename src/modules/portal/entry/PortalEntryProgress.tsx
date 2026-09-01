import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Tick02Icon,
} from '@hugeicons/core-free-icons';

interface PortalEntryProgressProps {
  progress: number;
  stageLabel: string;
  isReady: boolean;
  accentColor?: string;
}

export const PortalEntryProgress: React.FC<PortalEntryProgressProps> = ({
  progress,
  stageLabel,
  isReady,
  accentColor = '#06B6D4',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const checklist = [
    { label: 'Identity', isDone: clampedProgress >= 50 },
    { label: 'Project', isDone: clampedProgress >= 65 },
    { label: 'Access', isDone: clampedProgress >= 80 },
    { label: 'Workspace', isDone: clampedProgress >= 95 },
  ];

  return (
    <div
      className="w-full max-w-sm sm:max-w-md mx-auto space-y-3 font-mono select-none"
      role="region"
      aria-label="Portal Loading Progress"
    >
      {/* Top Numeric Progress and Stage Label */}
      <div className="flex items-baseline justify-between gap-4">
        <span
          className="text-xs sm:text-[13px] text-zinc-400 font-sans tracking-wide truncate"
          aria-live="polite"
        >
          {stageLabel}
        </span>

        <div className="flex items-baseline font-mono text-zinc-200 font-bold tracking-tight">
          <span className="text-xl sm:text-2xl tabular-nums">
            {clampedProgress}
          </span>
          <span className="text-xs sm:text-sm text-zinc-500 ml-0.5">%</span>
        </div>
      </div>

      {/* 2px Restrained Progress Line */}
      <div
        className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden relative"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Secure portal preparation progress"
      >
        <motion.div
          className="h-full rounded-full transition-all duration-150 ease-out relative"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: isReady ? '#FAFAFA' : accentColor,
            boxShadow: `0 0 8px ${accentColor}80`,
          }}
        >
          {/* Subtle Leading Glow Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[1px] opacity-90" />
        </motion.div>
      </div>

      {/* Micro-status Checklist */}
      <div className="pt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-500 font-mono">
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1 transition-colors duration-300 ${
              item.isDone ? 'text-zinc-300 font-medium' : 'text-zinc-600'
            }`}
          >
            {item.isDone ? (
              <HugeiconsIcon icon={Tick02Icon} size={11} className="text-emerald-400" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 inline-block" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortalEntryProgress;
