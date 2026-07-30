import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Flag01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Clock01Icon,
  AlertCircleIcon,
  ChartHistogramIcon
} from '@hugeicons/core-free-icons';
import type { Milestone } from '../../../types';

interface MilestoneStatisticsProps {
  milestones: Milestone[];
}

export const MilestoneStatistics: React.FC<MilestoneStatisticsProps> = ({ milestones }) => {
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'completed' || m.progress >= 100).length;
  const inProgress = milestones.filter(
    (m) => (m.status === 'in_progress' || (m.progress > 0 && m.progress < 100)) && m.status !== 'completed'
  ).length;

  const now = new Date();
  const overdue = milestones.filter((m) => {
    if (m.status === 'completed' || m.progress >= 100) return false;
    const due = m.due_date || m.dueDate;
    if (!due) return false;
    return new Date(due) < now;
  }).length;

  const upcoming = Math.max(0, total - completed - inProgress - overdue);

  const overallProgress =
    total > 0
      ? Math.round(milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / total)
      : 0;

  const statCards = [
    {
      label: 'Total',
      labelFull: 'Total Milestones',
      value: total,
      subtitle: 'All checkpoints',
      icon: Flag01Icon,
      color: 'text-zinc-300',
      bgColor: 'bg-zinc-900',
      borderColor: 'border-zinc-800',
      trend: `${total} configured`,
    },
    {
      label: 'Done',
      labelFull: 'Completed',
      value: completed,
      subtitle: 'Delivered',
      icon: CheckmarkCircle02Icon,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-800/50',
      trend: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`,
    },
    {
      label: 'Active',
      labelFull: 'In Progress',
      value: inProgress,
      subtitle: 'Development',
      icon: Loading03Icon,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-800/50',
      trend: 'Underway',
    },
    {
      label: 'Upcoming',
      labelFull: 'Upcoming',
      value: upcoming,
      subtitle: 'Planned',
      icon: Clock01Icon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-800/50',
      trend: 'Scheduled',
    },
    {
      label: 'Overdue',
      labelFull: 'Overdue',
      value: overdue,
      subtitle: 'Attention',
      icon: AlertCircleIcon,
      color: overdue > 0 ? 'text-rose-400' : 'text-zinc-500',
      bgColor: overdue > 0 ? 'bg-rose-950/40' : 'bg-zinc-900/60',
      borderColor: overdue > 0 ? 'border-rose-800/50' : 'border-zinc-800',
      trend: overdue > 0 ? 'Action needed' : 'On track',
    },
    {
      label: 'Progress',
      labelFull: 'Overall Progress',
      value: `${overallProgress}%`,
      subtitle: 'Average state',
      icon: ChartHistogramIcon,
      color: 'text-amber-300',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-800/50',
      trend: `${completed}/${total}`,
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 select-none">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`p-2 sm:p-3.5 rounded-sm border ${card.borderColor} ${card.bgColor} backdrop-blur-xl space-y-1 sm:space-y-2 flex flex-col justify-between transition-all hover:border-zinc-700 overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] sm:text-[10px] text-zinc-400 font-sans uppercase font-bold tracking-wider truncate">
              <span className="sm:hidden">{card.label}</span>
              <span className="hidden sm:inline">{card.labelFull}</span>
            </span>
            <div className={`p-0.5 sm:p-1 rounded-sm bg-zinc-950/80 ${card.color} shrink-0`}>
              <HugeiconsIcon icon={card.icon} size={12} className="sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          <div>
            <div className={`text-base sm:text-xl md:text-2xl font-extrabold font-mono tracking-tight ${card.color}`}>
              {card.value}
            </div>
            <p className="text-[8px] sm:text-[10px] text-zinc-500 font-sans truncate">{card.subtitle}</p>
          </div>

          <div className="pt-1 sm:pt-1.5 border-t border-zinc-800/60 text-[8px] sm:text-[9px] font-mono text-zinc-400 flex items-center justify-between gap-1">
            <span className="hidden sm:inline">Status</span>
            <strong className="text-zinc-300 truncate">{card.trend}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MilestoneStatistics;
