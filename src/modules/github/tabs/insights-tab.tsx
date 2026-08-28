import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface InsightsTabProps {
  projectId: string;
  telemetry: any;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({ telemetry }) => {
  // Build commit velocity from real commit data
  const commits = telemetry?.commits || [];
  const commitsByDay: Record<string, number> = {};

  commits.forEach((c: any) => {
    if (c.date) {
      const day = new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' });
      commitsByDay[day] = (commitsByDay[day] || 0) + 1;
    }
  });

  const commitData = Object.entries(commitsByDay).map(([day, count]) => ({ day, commits: count }));

  // Build PR velocity from real PR data
  const pullRequests = telemetry?.pullRequests || [];
  const openPRs = pullRequests.filter((p: any) => p.state === 'open').length;
  const closedPRs = pullRequests.filter((p: any) => p.state === 'closed').length;

  const prData = [
    { label: 'Open', count: openPRs },
    { label: 'Closed', count: closedPRs },
  ];

  const hasData = commitData.length > 0 || pullRequests.length > 0;

  if (!hasData) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 rounded-sm bg-zinc-900 border border-zinc-800 text-center text-zinc-500 text-xs font-mono">
          Sync repository to generate insights and analytics charts.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Commit Velocity Chart */}
        {commitData.length > 0 && (
          <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white text-xs">Commit Distribution by Day</span>
              <span className="text-[10px] text-cyan-400 font-mono">{commits.length} total</span>
            </div>

            <div className="h-48 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 180 }}>
                <AreaChart data={commitData}>
                  <XAxis dataKey="day" stroke="#71717A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="commits" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* PR Distribution Chart */}
        {pullRequests.length > 0 && (
          <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white text-xs">Pull Request Status</span>
              <span className="text-[10px] text-emerald-400 font-mono">{pullRequests.length} total</span>
            </div>

            <div className="h-48 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 180 }}>
                <BarChart data={prData}>
                  <XAxis dataKey="label" stroke="#71717A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#34D399" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
