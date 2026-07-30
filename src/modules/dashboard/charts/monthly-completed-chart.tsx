import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { supabase } from '../../../lib/supabase/client';
import { requestQueue } from '../../../lib/utils/request-queue';
import { ChartTooltip } from './chart-tooltip';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

export const MonthlyCompletedChart: React.FC = () => {
  const { data: trendData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'charts', 'monthly-completed'],
    queryFn: () =>
      requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('created_at, status')
          .eq('status', 'completed');

        if (error) throw error;

        // Generate last 6 months buckets
        const monthsMap: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          monthsMap[monthName] = 0;
        }

        (data || []).forEach((proj) => {
          const monthName = new Date(proj.created_at).toLocaleDateString('en-US', { month: 'short' });
          if (monthsMap[monthName] !== undefined) {
            monthsMap[monthName] += 1;
          }
        });

        return Object.entries(monthsMap).map(([month, count]) => ({
          month,
          completed: count,
        }));
      }, 'medium'),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="h-64 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-between">
        <span>Failed to load monthly trend chart.</span>
        <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const vibrantColors = ['#06B6D4', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'];

  return (
    <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 sm:space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400" />
          <span>Monthly Completion Trend</span>
        </div>
        <span className="text-[10px] text-emerald-400 uppercase font-bold">Last 6 Months</span>
      </div>

      <div className="h-56 sm:h-60 w-full min-h-[220px] outline-none [&_*]:outline-none">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 240 }} minWidth={0} minHeight={200}>
          <BarChart data={trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#52525b" fontSize={10} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<ChartTooltip valueFormatter={(val) => `${val} Completed`} />} />
            <Bar dataKey="completed" radius={[3, 3, 0, 0]} barSize={24}>
              {(trendData || []).map((_, index) => (
                <Cell key={`cell-${index}`} fill={vibrantColors[index % vibrantColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
