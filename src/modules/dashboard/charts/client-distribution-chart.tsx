import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { supabase } from '../../../lib/supabase/client';
import { requestQueue } from '../../../lib/utils/request-queue';
import { ChartTooltip } from './chart-tooltip';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon } from '@hugeicons/core-free-icons';

const CLIENT_COLORS = ['#A855F7', '#06B6D4', '#10B981', '#F59E0B', '#3B82F6'];

export const ClientDistributionChart: React.FC = () => {
  const { data: clientData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'charts', 'client-distribution'],
    queryFn: () =>
      requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('clients(name)')
          .not('client_id', 'is', null);

        if (error) throw error;

        const counts: Record<string, number> = {};
        (data || []).forEach((proj: any) => {
          const clientName = Array.isArray(proj.clients) ? proj.clients[0]?.name : proj.clients?.name;
          if (clientName) {
            counts[clientName] = (counts[clientName] || 0) + 1;
          }
        });

        return Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }, 'medium'),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="h-64 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-between">
        <span>Failed to load client distribution chart.</span>
        <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 sm:space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <HugeiconsIcon icon={UserGroupIcon} size={18} className="text-purple-400" />
          <span>Projects Per Client Distribution</span>
        </div>
        <span className="text-[10px] text-purple-400 uppercase font-bold">Client Telemetry</span>
      </div>

      {!clientData || clientData.length === 0 ? (
        <ProjectEmptyState
          title="No Client Telemetry"
          description="Assign clients to projects to monitor project distribution."
          icon={UserGroupIcon}
          className="py-8"
        />
      ) : (
        <div className="h-56 sm:h-60 w-full min-h-[220px] outline-none [&_*]:outline-none">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 240 }} minWidth={0} minHeight={200}>
            <BarChart data={clientData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" stroke="#52525b" fontSize={10} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={10} width={90} axisLine={false} tickLine={false} />
              <Tooltip cursor={false} content={<ChartTooltip valueFormatter={(val) => `${val} Projects`} />} />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={14}>
                {clientData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CLIENT_COLORS[index % CLIENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
