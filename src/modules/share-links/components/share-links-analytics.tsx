import React from 'react';
import { useShareLinkAnalyticsSummary } from '../../../lib/supabase/queries/share-links';
import type { FormattedShareLink } from '../../../lib/services/share.service';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  EyeIcon,
  Link01Icon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
  Cancel01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';

interface ShareLinksAnalyticsProps {
  projectId?: string;
  links: FormattedShareLink[];
}

export const ShareLinksAnalytics: React.FC<ShareLinksAnalyticsProps> = ({
  projectId,
  links,
}) => {
  const { data: summary, isLoading } = useShareLinkAnalyticsSummary(projectId, links);

  if (isLoading) {
    return (
      <div className="p-6 rounded bg-zinc-950/80 border border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
        <RadialSpinner size={16} />
        <span>Loading analytics summary...</span>
      </div>
    );
  }

  const maxDailyViews = Math.max(1, ...(summary?.viewsByDay.map((d) => d.views) || [1]));

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
            <HugeiconsIcon icon={Link01Icon} size={12} className="text-cyan-400" />
            <span>Total Links</span>
          </div>
          <div className="text-base font-bold text-white">{summary?.totalLinks || 0}</div>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-emerald-400" />
            <span>Active Links</span>
          </div>
          <div className="text-base font-bold text-emerald-400">{summary?.activeLinks || 0}</div>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-amber-400" />
            <span>Expired Links</span>
          </div>
          <div className="text-base font-bold text-amber-400">{summary?.expiredLinks || 0}</div>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
            <HugeiconsIcon icon={Cancel01Icon} size={12} className="text-zinc-500" />
            <span>Disabled Links</span>
          </div>
          <div className="text-base font-bold text-zinc-400">{summary?.disabledLinks || 0}</div>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
            <HugeiconsIcon icon={EyeIcon} size={12} className="text-sky-400" />
            <span>Total Views</span>
          </div>
          <div className="text-base font-bold text-sky-400">{summary?.totalViews || 0}</div>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
            <HugeiconsIcon icon={UserIcon} size={12} className="text-purple-400" />
            <span>Unique Visitors</span>
          </div>
          <div className="text-base font-bold text-purple-400">{summary?.uniqueViews || 0}</div>
        </div>
      </div>

      {/* Daily Views Bar Graph */}
      {summary?.viewsByDay && summary.viewsByDay.length > 0 && (
        <div className="p-4 rounded bg-zinc-950 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
            <span>Daily Portal Views (Past 7 Days)</span>
            <span className="text-[10px] text-zinc-500">Realtime Event Logger</span>
          </div>

          <div className="h-24 flex items-end justify-between gap-2 pt-2 border-t border-zinc-900">
            {summary.viewsByDay.map((day) => {
              const heightPct = Math.round((day.views / maxDailyViews) * 100);

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="text-[9.5px] text-zinc-400 font-mono">{day.views}</div>
                  <div
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                    className="w-full max-w-[36px] bg-cyan-500/80 rounded-t hover:bg-cyan-400 transition-colors"
                  />
                  <div className="text-[9px] text-zinc-500 truncate w-full text-center">{day.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
