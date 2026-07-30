import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Tag01Icon,
  GitBranchIcon,
  ActivityIcon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import type { Milestone } from '../../../types';

interface MilestoneMetadataProps {
  milestone: Milestone;
}

export const MilestoneMetadata: React.FC<MilestoneMetadataProps> = ({ milestone }) => {
  const owner = milestone.owner_name || milestone.ownerName || 'Project Lead';
  const version = milestone.version || 'v1.0';
  const sprint = milestone.sprint || 'Sprint 1';
  const labels = milestone.labels || ['Release', 'Core'];
  const updatedAt = milestone.updated_at
    ? new Date(milestone.updated_at).toLocaleDateString()
    : 'Recently';

  return (
    <div className="p-3 rounded-sm bg-zinc-950/70 border border-zinc-850 space-y-2.5 text-[11px] font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Owner */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
            <HugeiconsIcon icon={UserIcon} size={11} />
            Owner
          </span>
          <span className="text-zinc-200 font-bold block truncate">{owner}</span>
        </div>

        {/* Version & Release */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
            <HugeiconsIcon icon={Tag01Icon} size={11} />
            Version / Release
          </span>
          <span className="text-zinc-200 font-bold block truncate">{version}</span>
        </div>

        {/* Sprint */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
            <HugeiconsIcon icon={GitBranchIcon} size={11} />
            Sprint Target
          </span>
          <span className="text-zinc-200 font-bold block truncate">{sprint}</span>
        </div>

        {/* Last Activity */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold flex items-center gap-1">
            <HugeiconsIcon icon={ActivityIcon} size={11} />
            Last Activity
          </span>
          <span className="text-zinc-300 font-sans block truncate">{updatedAt}</span>
        </div>
      </div>

      {/* Labels Badges */}
      {labels.length > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-850 overflow-x-auto">
          <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold shrink-0">Labels:</span>
          {labels.map((lbl, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="rounded-sm bg-zinc-900 text-zinc-300 border-zinc-800 text-[9px] font-mono px-2 py-0.5"
            >
              #{lbl}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MilestoneMetadata;
