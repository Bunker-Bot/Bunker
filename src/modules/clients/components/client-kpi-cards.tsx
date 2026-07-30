import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  UserCheck01Icon,
  Folder01Icon,
  GlobalIcon,
  SparklesIcon,
  Clock01Icon
} from '@hugeicons/core-free-icons';
import { useClientCounts } from '../../../lib/supabase/queries/clients';

export const ClientKpiCards: React.FC = () => {
  const { data: counts, isLoading } = useClientCounts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-sm bg-zinc-900/60 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const c = counts || {
    totalClients: 0,
    activeClients: 0,
    clientsWithActiveProjects: 0,
    countriesCount: 0,
    totalProjects: 0,
    recentlyAdded30Days: 0,
  };

  const cards = [
    {
      title: 'Total Clients',
      value: c.totalClients,
      subtitle: 'Registered accounts',
      icon: UserGroupIcon,
      accent: 'text-white',
    },
    {
      title: 'Active Clients',
      value: c.activeClients,
      subtitle: 'Active contract engagements',
      icon: UserCheck01Icon,
      accent: 'text-emerald-400',
    },
    {
      title: 'Active Projects',
      value: c.clientsWithActiveProjects,
      subtitle: 'Clients with live sprints',
      icon: Folder01Icon,
      accent: 'text-cyan-400',
    },
    {
      title: 'Global Regions',
      value: c.countriesCount,
      subtitle: 'Countries represented',
      icon: GlobalIcon,
      accent: 'text-purple-400',
    },
    {
      title: 'Total Projects',
      value: c.totalProjects,
      subtitle: 'Assigned client repos',
      icon: SparklesIcon,
      accent: 'text-amber-400',
    },
    {
      title: 'Recently Added',
      value: c.recentlyAdded30Days,
      subtitle: 'Registered last 30 days',
      icon: Clock01Icon,
      accent: 'text-emerald-400',
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

          <p className="text-[9px] text-zinc-500 font-sans truncate">{card.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
};
