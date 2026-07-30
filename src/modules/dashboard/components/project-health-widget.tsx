import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SecurityCheckIcon, AlertCircleIcon, CheckmarkCircle02Icon, Clock01Icon, HelpCircleIcon } from '@hugeicons/core-free-icons';
import { useWorkspaceHealth } from '../../../lib/supabase/queries/dashboard';

export const ProjectHealthWidget: React.FC = () => {
  const { data: health, isLoading } = useWorkspaceHealth();

  if (isLoading) {
    return <div className="h-44 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const h = health || {
    healthyCount: 1,
    warningCount: 0,
    criticalCount: 0,
    blockedCount: 0,
    healthScore: 96,
  };

  const total = h.healthyCount + h.warningCount + h.criticalCount + h.blockedCount || 1;

  const categories = [
    { label: 'Healthy', count: h.healthyCount, color: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-800', icon: CheckmarkCircle02Icon },
    { label: 'Warning', count: h.warningCount, color: 'text-amber-400', bg: 'bg-amber-400', border: 'border-amber-800', icon: Clock01Icon },
    { label: 'Critical', count: h.criticalCount, color: 'text-rose-400', bg: 'bg-rose-400', border: 'border-rose-800', icon: AlertCircleIcon },
    { label: 'Blocked', count: h.blockedCount, color: 'text-zinc-400', bg: 'bg-zinc-500', border: 'border-zinc-800', icon: HelpCircleIcon },
  ];

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3.5 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={SecurityCheckIcon} size={16} className="text-emerald-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Project Health Categorization</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-400">Score: {h.healthScore}%</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map((cat) => {
          const percent = Math.round((cat.count / total) * 100);
          return (
            <div key={cat.label} className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-zinc-400 flex items-center gap-1">
                  <HugeiconsIcon icon={cat.icon} size={12} className={cat.color} />
                  {cat.label}
                </span>
                <span className={`font-bold ${cat.color}`}>{cat.count}</span>
              </div>
              <div className="w-full h-1.5 rounded-sm bg-zinc-900 overflow-hidden border border-zinc-800">
                <div className={`h-full ${cat.bg} rounded-sm`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
