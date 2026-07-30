import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Link01Icon,
  CodeIcon,
  Doc01Icon,
  FolderOpenIcon,
  CellularNetworkIcon
} from '@hugeicons/core-free-icons';
import type { MilestoneDeliverable } from '../../../types';

interface MilestoneDeliverablesProps {
  deliverables?: MilestoneDeliverable[];
  readonly?: boolean;
}

export const MilestoneDeliverables: React.FC<MilestoneDeliverablesProps> = ({
  deliverables = [],
  readonly = false,
}) => {
  const getDeliverableIcon = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'design':
        return FolderOpenIcon;
      case 'backend':
      case 'api':
        return CodeIcon;
      case 'docs':
        return Doc01Icon;
      case 'devops':
      case 'build':
        return CellularNetworkIcon;
      default:
        return Link01Icon;
    }
  };

  return (
    <div className="space-y-2.5 font-mono text-xs select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-cyan-400" />
          Milestone Deliverables ({deliverables.length})
        </span>
        <span className="text-[10px] text-zinc-500 font-sans">
          {readonly ? 'Verified Access' : 'Manageable Checklist'}
        </span>
      </div>

      {deliverables.length === 0 ? (
        <div className="p-3 rounded-sm bg-zinc-950/60 border border-zinc-850 text-zinc-500 text-[11px] font-sans">
          No deliverables added to this milestone checkpoint yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {deliverables.map((item) => {
            const IconComp = getDeliverableIcon(item.type);
            const isDone = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-sm border ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : isInProgress
                    ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-300'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                } flex items-center justify-between text-[11px]`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div
                    className={`p-1 rounded-sm ${
                      isDone
                        ? 'bg-emerald-900/60 text-emerald-400'
                        : isInProgress
                        ? 'bg-cyan-900/60 text-cyan-400'
                        : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <HugeiconsIcon icon={IconComp} size={13} />
                  </div>
                  <span className="font-bold truncate text-white">{item.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${
                      isDone
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : isInProgress
                        ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {isDone ? 'Delivered' : isInProgress ? 'In Review' : 'Pending'}
                  </span>

                  {item.url && item.url !== '#' && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Open Link"
                    >
                      <HugeiconsIcon icon={Link01Icon} size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MilestoneDeliverables;
