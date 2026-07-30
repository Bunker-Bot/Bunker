import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon, AlertCircleIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import type { MilestoneDependency } from '../../../types';

interface MilestoneDependenciesProps {
  dependencies?: (string | MilestoneDependency)[];
  isBlocked?: boolean;
}

export const MilestoneDependencies: React.FC<MilestoneDependenciesProps> = ({
  dependencies = [],
  isBlocked = false,
}) => {
  if (dependencies.length === 0) return null;

  return (
    <div className="p-3 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-2 text-[11px] font-mono select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-sans font-bold uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={GitBranchIcon} size={13} className="text-cyan-400" />
          Milestone Dependencies Chain
        </span>
        {isBlocked && (
          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded-sm border border-amber-800">
            <HugeiconsIcon icon={AlertCircleIcon} size={12} />
            Waiting on Prerequisites
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {dependencies.map((dep, idx) => {
          const depName = typeof dep === 'string' ? dep : dep.name;
          const depStatus = typeof dep === 'string' ? 'completed' : dep.status || 'completed';
          const isDone = depStatus === 'completed';

          return (
            <React.Fragment key={idx}>
              <div
                className={`px-2.5 py-1 rounded-sm border text-[10px] flex items-center gap-1.5 ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                }`}
              >
                <HugeiconsIcon
                  icon={isDone ? CheckmarkCircle02Icon : AlertCircleIcon}
                  size={12}
                  className={isDone ? 'text-emerald-400' : 'text-amber-400'}
                />
                <span className="font-bold">{depName}</span>
              </div>
              {idx < dependencies.length - 1 && (
                <span className="text-zinc-600 font-bold">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneDependencies;
