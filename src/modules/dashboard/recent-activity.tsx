import React from 'react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { HugeiconsIcon } from '@hugeicons/react';
import { Time02Icon } from '@hugeicons/core-free-icons';

export const RecentActivity: React.FC = () => {
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary();

  // Scoped Realtime updates on activity_logs
  useRealtimeSubscription({
    table: 'activity_logs',
    queryKeyToInvalidate: ['dashboard', 'summary'],
  });

  if (isLoading) {
    return <div className="h-64 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-between">
        <span>Failed to load recent activity feed.</span>
        <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const activities = summary?.recentActivity || [];

  return (
    <div className="p-5 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <HugeiconsIcon icon={Time02Icon} size={18} className="text-zinc-400" />
          <span>Recent Activity Log</span>
        </div>
        <span className="text-[10px] text-zinc-500 uppercase font-semibold">10 Initial Records</span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 italic">No recent system activity recorded yet.</div>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
          {activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-950/60 border border-zinc-800/80 text-zinc-300">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                <span className="font-semibold text-white truncate">{item.actionTitle}</span>
                <span className="px-1.5 py-0.5 rounded-sm bg-zinc-800 text-[10px] text-zinc-400 uppercase font-bold">{item.entityType}</span>
              </div>
              <span className="text-[11px] text-zinc-500 shrink-0">{item.timeAgo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
