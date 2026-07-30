import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { HardDriveIcon } from '@hugeicons/core-free-icons';
import { useWorkspaceStorage } from '../../../lib/supabase/queries/dashboard';

export const StorageAnalyticsWidget: React.FC = () => {
  const { data: storageData, isLoading } = useWorkspaceStorage();

  if (isLoading) {
    return <div className="h-52 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const s = storageData || {
    documentsCount: 0,
    screenshotsCount: 0,
    markdownCount: 0,
    shareLinksCount: 0,
    usedMB: 18,
    availableMB: 4982,
    percentageUsed: 1,
  };

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={HardDriveIcon} size={16} className="text-amber-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Vault Storage Analytics</h3>
        </div>
        <span className="text-[10px] text-amber-400 font-bold">{s.usedMB} MB / 5.0 GB</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">Storage Allocated</span>
          <span className="font-bold text-white">{s.percentageUsed}%</span>
        </div>

        <div className="w-full h-2 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800">
          <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-sm" style={{ width: `${Math.max(4, s.percentageUsed)}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Documents</span>
            <p className="font-bold text-white">{s.documentsCount} Specs</p>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Screenshots</span>
            <p className="font-bold text-cyan-400">{s.screenshotsCount} Assets</p>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Markdown</span>
            <p className="font-bold text-purple-400">{s.markdownCount} Notes</p>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Share Links</span>
            <p className="font-bold text-emerald-400">{s.shareLinksCount} Portals</p>
          </div>
        </div>
      </div>
    </div>
  );
};
