import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  UserGroupIcon,
  GithubIcon,
  HardDriveIcon
} from '@hugeicons/core-free-icons';
import { useDashboardKPIs } from '../../../lib/supabase/queries/dashboard';

export const DashboardKpiRow: React.FC = () => {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-sm bg-zinc-900/60 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const data = kpis || {
    totalProjects: 1,
    activeProjects: 1,
    completedProjects: 0,
    activeClients: 1,
    connectedRepos: 1,
    usedStorageMB: 18,
    totalStorageGB: 5.0,
  };

  const cards = [
    {
      title: 'Total Projects',
      value: data.totalProjects,
      subtitle: '+100% active repo',
      icon: Folder01Icon,
      accent: 'text-white',
      progress: 100,
      barColor: 'bg-white',
    },
    {
      title: 'Active Projects',
      value: data.activeProjects,
      subtitle: 'In active sprint',
      icon: Clock01Icon,
      accent: 'text-emerald-400',
      progress: data.totalProjects > 0 ? Math.round((data.activeProjects / data.totalProjects) * 100) : 0,
      barColor: 'bg-emerald-400',
    },
    {
      title: 'Completed',
      value: data.completedProjects,
      subtitle: 'Production releases',
      icon: CheckmarkCircle02Icon,
      accent: 'text-cyan-400',
      progress: data.totalProjects > 0 ? Math.round((data.completedProjects / data.totalProjects) * 100) : 0,
      barColor: 'bg-cyan-400',
    },
    {
      title: 'Active Clients',
      value: data.activeClients,
      subtitle: 'Verified accounts',
      icon: UserGroupIcon,
      accent: 'text-purple-400',
      progress: 100,
      barColor: 'bg-purple-400',
    },
    {
      title: 'Connected Repos',
      value: data.connectedRepos,
      subtitle: 'GitHub sync live',
      icon: GithubIcon,
      accent: 'text-emerald-400',
      progress: 100,
      barColor: 'bg-emerald-400',
    },
    {
      title: 'Vault Storage',
      value: `${data.usedStorageMB} MB`,
      subtitle: `of ${data.totalStorageGB} GB max`,
      icon: HardDriveIcon,
      accent: 'text-amber-400',
      progress: Math.min(100, Math.round((data.usedStorageMB / 5000) * 100)),
      barColor: 'bg-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono select-none">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 shadow-sm space-y-2 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{card.title}</span>
            <HugeiconsIcon icon={card.icon} size={15} className={`${card.accent} group-hover:scale-110 transition-transform`} />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-white">
              {card.value}
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="w-full h-1 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(5, card.progress)}%` }}
                transition={{ duration: 0.6 }}
                className={`h-full ${card.barColor} rounded-sm`}
              />
            </div>
            <p className="text-[9px] text-zinc-500 font-sans truncate">{card.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
