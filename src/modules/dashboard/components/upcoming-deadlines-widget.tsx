import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useUpcomingDeadlines } from '../../../lib/supabase/queries/dashboard';
import { Badge } from '../../../components/ui/badge';

export const UpcomingDeadlinesWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data: deadlinesList, isLoading } = useUpcomingDeadlines();

  if (isLoading) {
    return <div className="h-52 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const items = deadlinesList || [];

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-amber-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Upcoming Project Deadlines</h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-bold">{items.length} Target Milestones</span>
      </div>

      {items.length === 0 ? (
        <div className="p-4 text-center rounded bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs font-sans">
          No upcoming target deadlines logged.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div
              key={item.id}
              onClick={() => navigate(`/app/projects/${item.slug}`)}
              className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white truncate text-xs group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </span>
                  <Badge variant="outline" className="rounded-sm bg-zinc-900 text-amber-400 border-amber-800/80 text-[9px] font-bold uppercase px-1.5 py-0">
                    {item.priority || 'Medium'}
                  </Badge>
                </div>
                <span className="text-[10px] text-zinc-500 font-sans block truncate">
                  Client: {item.clientName} • Target: {item.formattedDeadline}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-bold font-mono ${item.isOverdue ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                  {item.isOverdue ? `${Math.abs(item.daysRemaining)}d Overdue` : `${item.daysRemaining}d Left`}
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
