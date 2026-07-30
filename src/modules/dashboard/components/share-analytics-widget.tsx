import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link01Icon } from '@hugeicons/core-free-icons';
import { useShareAnalytics } from '../../../lib/supabase/queries/dashboard';

export const ShareAnalyticsWidget: React.FC = () => {
  const { data: shareData, isLoading } = useShareAnalytics();

  if (isLoading) {
    return <div className="h-52 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const s = shareData || {
    totalLinks: 0,
    activeLinks: 0,
    expiredLinks: 0,
    totalViews: 0,
    topProject: 'PawCareAI',
  };

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Link01Icon} size={16} className="text-cyan-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Share Link & Portal Analytics</h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">{s.activeLinks} Active Portals</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Total Portals</span>
          <p className="font-bold text-white text-sm">{s.totalLinks}</p>
        </div>
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Active Links</span>
          <p className="font-bold text-cyan-400 text-sm">{s.activeLinks}</p>
        </div>
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Total Views</span>
          <p className="font-bold text-emerald-400 text-sm">{s.totalViews}</p>
        </div>
        <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Top Viewed</span>
          <p className="font-bold text-zinc-200 text-xs truncate">{s.topProject}</p>
        </div>
      </div>
    </div>
  );
};
