import React, { useState, useEffect } from 'react';
import { useRecentActivity } from '../../lib/supabase/queries/dashboard';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { HugeiconsIcon } from '@hugeicons/react';
import { Time02Icon, ActivityIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { Badge } from '../../components/ui/badge';

export const RecentActivityFeed: React.FC = () => {
  const { data: initialActivities, isLoading, isError, refetch } = useRecentActivity(20);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    if (initialActivities) {
      setFeed(initialActivities);
    }
  }, [initialActivities]);

  // Scoped Realtime channel on activity_logs and project_updates
  useRealtimeSubscription({
    table: 'project_updates',
    queryKeyToInvalidate: ['dashboard', 'activity'],
  });

  if (isLoading) {
    return <div className="h-64 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-between">
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={ActivityIcon} size={16} className="text-zinc-400" />
          <span>Failed to load activity timeline.</span>
        </span>
        <button onClick={() => refetch()} className="flex items-center gap-1 text-white hover:underline cursor-pointer">
          <HugeiconsIcon icon={RefreshIcon} size={14} /> Retry
        </button>
      </div>
    );
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'DEPLOYMENT':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'GITHUB':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'SHARE_LINK':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'SYSTEM':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'MILESTONE':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 sm:space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <HugeiconsIcon icon={Time02Icon} size={18} className="text-emerald-400" />
          <span>System Activity Feed</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold uppercase">Realtime Telemetry Stream</span>
      </div>

      {feed.length === 0 ? (
        <div className="py-8 sm:py-12 text-center text-zinc-500 italic space-y-2">
          <HugeiconsIcon icon={ActivityIcon} size={24} className="mx-auto text-zinc-600" />
          <div>No recent system activity recorded yet.</div>
          <p className="text-[11px] text-zinc-600">Your latest project actions will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
          {feed.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-sm bg-zinc-950 border border-zinc-800/80 text-zinc-300 transition-colors hover:border-zinc-700">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="font-bold text-white truncate text-xs">{item.actorName || 'Administrator'}</span>
                <span className="text-zinc-400 text-xs truncate">— {item.actionTitle}</span>
                <Badge variant="outline" className={`rounded-sm text-[9px] font-bold uppercase px-1.5 py-0 shrink-0 ${getBadgeVariant(item.entityType)}`}>
                  {item.entityType}
                </Badge>
              </div>
              <span className="text-[11px] text-zinc-500 font-bold shrink-0 ml-2">{item.timeAgo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
