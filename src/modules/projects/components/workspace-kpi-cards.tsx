import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  SparklesIcon,
  GithubIcon
} from '@hugeicons/core-free-icons';

interface WorkspaceKpiCardsProps {
  counts: any;
  isLoading?: boolean;
}

export const WorkspaceKpiCards: React.FC<WorkspaceKpiCardsProps> = ({ counts, isLoading }) => {
  const total = counts?.totalProjects || 0;
  const active = counts?.activeProjects || 0;
  const completed = counts?.completedProjects || 0;
  const overdue = counts?.overdueProjects || 0;
  const avgCompletion = counts?.averageCompletion || 0;
  const githubRepos = counts?.totalGithubRepos || 0;

  const kpis = [
    {
      title: 'Total Projects',
      value: total,
      unit: 'Workspaces',
      description: 'Active & archived repos',
      icon: Folder01Icon,
      accent: 'text-white',
      progress: 100,
      barColor: 'bg-white',
    },
    {
      title: 'Active Projects',
      value: active,
      unit: 'In Flight',
      description: 'Under active development',
      icon: Clock01Icon,
      accent: 'text-emerald-400',
      progress: total > 0 ? Math.round((active / total) * 100) : 0,
      barColor: 'bg-emerald-400',
    },
    {
      title: 'Completed',
      value: completed,
      unit: 'Delivered',
      description: 'Production releases',
      icon: CheckmarkCircle02Icon,
      accent: 'text-cyan-400',
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      barColor: 'bg-cyan-400',
    },
    {
      title: 'Overdue',
      value: overdue,
      unit: 'Action Needed',
      description: 'Passed target deadline',
      icon: AlertCircleIcon,
      accent: overdue > 0 ? 'text-rose-400' : 'text-zinc-400',
      progress: total > 0 ? Math.round((overdue / total) * 100) : 0,
      barColor: overdue > 0 ? 'bg-rose-500' : 'bg-zinc-600',
    },
    {
      title: 'Avg Completion',
      value: `${avgCompletion}%`,
      unit: 'Overall Rate',
      description: 'Weighted task progress',
      icon: SparklesIcon,
      accent: 'text-amber-400',
      progress: avgCompletion,
      barColor: 'bg-amber-400',
    },
    {
      title: 'GitHub Repos',
      value: githubRepos,
      unit: 'Connected',
      description: 'Live synced repositories',
      icon: GithubIcon,
      accent: 'text-white',
      progress: total > 0 ? Math.min(100, Math.round((githubRepos / total) * 100)) : 0,
      barColor: 'bg-emerald-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-sm bg-zinc-900/60 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 shadow-sm space-y-2 select-none group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{kpi.title}</span>
            <HugeiconsIcon icon={kpi.icon} size={15} className={`${kpi.accent} group-hover:scale-110 transition-transform`} />
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-white`}>
              {kpi.value}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold">{kpi.unit}</span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="w-full h-1 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${kpi.progress}%` }}
                transition={{ duration: 0.6 }}
                className={`h-full ${kpi.barColor} rounded-sm`}
              />
            </div>
            <p className="text-[9px] text-zinc-500 truncate font-sans">{kpi.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
