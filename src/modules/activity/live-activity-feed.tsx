import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase/client';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  GithubIcon,
  ActivityIcon,
  Clock01Icon
} from '@hugeicons/core-free-icons';

export interface ActivityLogItem {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface LiveActivityFeedProps {
  limit?: number;
  className?: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  limit = 10,
  className = '',
}) => {
  const { data: logs = [], isLoading } = useQuery<ActivityLogItem[]>({
    queryKey: ['activity_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[LiveActivityFeed] Failed to fetch activity logs:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Realtime updates for activity_logs table
  useRealtimeSubscription({
    table: 'activity_logs',
    queryKeyToInvalidate: ['activity_logs', limit],
  });

  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'project':
        return <HugeiconsIcon icon={Folder01Icon} size={14} className="text-rose-400" />;
      case 'client':
        return <HugeiconsIcon icon={UserGroupIcon} size={14} className="text-cyan-400" />;
      case 'task':
        return <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-400" />;
      case 'github_repository':
      case 'github':
        return <HugeiconsIcon icon={GithubIcon} size={14} className="text-purple-400" />;
      default:
        return <HugeiconsIcon icon={ActivityIcon} size={14} className="text-zinc-400" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs ${className}`}>
        <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-zinc-950/60 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 font-mono select-none text-xs shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={ActivityIcon} size={14} className="text-zinc-400" />
          <span>Live Activity Feed</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Realtime Sync</span>
        </span>
      </div>

      {logs.length > 0 ? (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {logs.map((log) => {
            const metaName = log.metadata?.name || log.metadata?.title || log.metadata?.repository;

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                      {getEntityIcon(log.entity_type)}
                    </div>
                    <span className="font-bold text-white text-xs truncate">{log.action}</span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono shrink-0 flex items-center gap-1">
                    <HugeiconsIcon icon={Clock01Icon} size={11} />
                    <span>{formatRelativeTime(log.created_at)}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
                  <span className="text-zinc-400 truncate">
                    Entity: {log.entity_type} {log.metadata?.status ? `• Status: ${log.metadata.status}` : ''}
                  </span>

                  {metaName && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 truncate max-w-[130px] sm:max-w-[180px] shrink-0"
                      title={metaName}
                    >
                      {metaName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-zinc-500 text-xs italic">
          No activity logs recorded yet. Action telemetry will stream here in realtime.
        </div>
      )}
    </div>
  );
};

export default LiveActivityFeed;
