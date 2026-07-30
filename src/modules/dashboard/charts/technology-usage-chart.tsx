import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { supabase } from '../../../lib/supabase/client';
import { requestQueue } from '../../../lib/utils/request-queue';
import { ChartTooltip } from './chart-tooltip';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { HugeiconsIcon } from '@hugeicons/react';
import { CpuIcon } from '@hugeicons/core-free-icons';

// Vibrant HSL Palette for Tech Brands
const TECH_COLORS = ['#61DAFB', '#3178C6', '#339933', '#3776AB', '#009688', '#10B981', '#A855F7', '#F59E0B'];

export const TechnologyUsageChart: React.FC = () => {
  const { data: techData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'charts', 'technology-usage'],
    queryFn: () =>
      requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('project_technologies')
          .select('name');

        if (error) throw error;

        const counts: Record<string, number> = {};
        (data || []).forEach((t) => {
          counts[t.name] = (counts[t.name] || 0) + 1;
        });

        return Object.entries(counts)
          .map(([name, count]) => ({ name, value: count }))
          .sort((a, b) => b.value - a.value)
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
        <span>Failed to load technology usage chart.</span>
        <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 sm:space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <HugeiconsIcon icon={CpuIcon} size={18} className="text-purple-400" />
          <span>Technology Stack Usage</span>
        </div>
        <span className="text-[10px] text-purple-400 uppercase font-bold">Top 5 Techs</span>
      </div>

      {!techData || techData.length === 0 ? (
        <ProjectEmptyState
          title="No Tech Telemetry"
          description="Add technologies to projects to monitor framework distribution."
          icon={CpuIcon}
          className="py-8"
        />
      ) : (
        <div className="h-56 sm:h-60 w-full min-h-[220px] outline-none [&_*]:outline-none">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 240 }} minWidth={0} minHeight={200}>
            <PieChart>
              <Pie
                data={techData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {techData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={TECH_COLORS[index % TECH_COLORS.length]} stroke="#18181b" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueFormatter={(val) => `${val} Projects`} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
