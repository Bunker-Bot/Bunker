import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { supabase } from '../../../lib/supabase/client';
import { requestQueue } from '../../../lib/utils/request-queue';
import { ChartTooltip } from './chart-tooltip';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon } from '@hugeicons/core-free-icons';

export const ProjectProgressChart: React.FC = () => {
  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'charts', 'project-progress'],
    queryFn: () =>
      requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, completion_percent, status, color')
          .order('completion_percent', { ascending: false })
          .limit(6);

        if (error) throw error;
        return data || [];
      }, 'medium'),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="h-64 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-between">
        <span>Failed to load project progress chart.</span>
        <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const getBarColor = (percent: number, customColor?: string) => {
    if (customColor && customColor !== '#E11D48') return customColor;
    if (percent >= 80) return '#10B981'; // Emerald
    if (percent >= 50) return '#06B6D4'; // Cyan
    if (percent >= 25) return '#F59E0B'; // Amber
    return '#E11D48'; // Rose
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 sm:space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <HugeiconsIcon icon={Folder01Icon} size={18} className="text-cyan-400" />
          <span>Project Completion Progress</span>
        </div>
        <span className="text-[10px] text-emerald-400 uppercase font-bold">Active Lifecycles</span>
      </div>

      {!projects || projects.length === 0 ? (
        <ProjectEmptyState
          title="No Project Telemetry"
          description="Create your first software project to monitor completion progress."
          icon={Folder01Icon}
          className="py-6 sm:py-8"
        />
      ) : (
        <div className="h-56 sm:h-60 w-full min-h-[220px] outline-none [&_*]:outline-none">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 240 }} minWidth={0} minHeight={200}>
            <BarChart data={projects} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#52525b" fontSize={10} tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={10} width={80} axisLine={false} tickLine={false} />
              <Tooltip cursor={false} content={<ChartTooltip valueFormatter={(val) => `${val}%`} />} />
              <Bar dataKey="completion_percent" radius={[0, 3, 3, 0]} barSize={14}>
                {projects.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.completion_percent, entry.color)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
