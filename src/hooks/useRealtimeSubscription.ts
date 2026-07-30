import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';

interface RealtimeConfig {
  table: string;
  filter?: string;
  queryKeyToInvalidate: any[];
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  filter,
  queryKeyToInvalidate,
  enabled = true,
}: RealtimeConfig) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channelId = Math.random().toString(36).substring(2, 7);
    const channelName = `realtime-${table}-${filter || 'all'}-${channelId}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, queryClient, enabled, JSON.stringify(queryKeyToInvalidate)]);
}

export default useRealtimeSubscription;
