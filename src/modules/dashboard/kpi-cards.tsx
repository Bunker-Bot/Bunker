import React from 'react';
import { motion } from 'framer-motion';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { cardContainerVariants, cardItemVariants } from '../../../packages/ui/src/theme/motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon, Tick02Icon, UserGroupIcon, Time02Icon, GitBranchIcon, DatabaseIcon } from '@hugeicons/core-free-icons';

export const KPICards: React.FC = () => {
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 sm:h-24 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-between">
        <span>Failed to load dashboard KPIs.</span>
        <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Projects',
      value: summary?.totalProjects ?? 0,
      icon: Folder01Icon,
    },
    {
      title: 'Active Projects',
      value: summary?.activeProjects ?? 0,
      icon: Time02Icon,
    },
    {
      title: 'Completed',
      value: summary?.completedProjects ?? 0,
      icon: Tick02Icon,
    },
    {
      title: 'Active Clients',
      value: summary?.totalClients ?? 0,
      icon: UserGroupIcon,
    },
    {
      title: 'Connected Repos',
      value: summary?.recentProjects?.length ?? 0,
      icon: GitBranchIcon,
    },
    {
      title: 'Vault Storage',
      value: '2.4 GB',
      icon: DatabaseIcon,
    },
  ];

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 font-mono text-xs select-none"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          variants={cardItemVariants}
          className="p-3 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-1.5 sm:space-y-2 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold truncate">{card.title}</span>
            <HugeiconsIcon icon={card.icon} size={15} className="text-zinc-400 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">{card.value}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default KPICards;
