import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Time02Icon,
  Tick02Icon,
  PauseIcon,
  Link01Icon,
  GithubIcon,
  CloudIcon,
  File01Icon,
  GlobalIcon,
  Clock01Icon
} from '@hugeicons/core-free-icons';
import { useClient360Statistics } from '../../../lib/supabase/queries/clients';

interface Client360StatsProps {
  clientId: string;
}

export const Client360Stats: React.FC<Client360StatsProps> = ({ clientId }) => {
  const { data: stats, isLoading } = useClient360Statistics(clientId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-20 rounded-sm bg-zinc-900/60 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const s = stats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    sharedLinksCount: 0,
    githubReposCount: 0,
    deploymentsCount: 0,
    documentsCount: 0,
    vaultStorage: '0.8 GB',
    timelineEntriesCount: 0,
  };

  const cards = [
    {
      title: 'Total Projects',
      value: s.totalProjects,
      subtitle: 'Assigned repositories',
      icon: Folder01Icon,
      accent: 'text-white',
    },
    {
      title: 'Active Projects',
      value: s.activeProjects,
      subtitle: 'Live active sprints',
      icon: Time02Icon,
      accent: 'text-emerald-400',
    },
    {
      title: 'Completed',
      value: s.completedProjects,
      subtitle: 'Delivered software',
      icon: Tick02Icon,
      accent: 'text-cyan-400',
    },
    {
      title: 'On Hold',
      value: s.onHoldProjects,
      subtitle: 'Paused lifecycles',
      icon: PauseIcon,
      accent: 'text-amber-400',
    },
    {
      title: 'Share Links',
      value: s.sharedLinksCount,
      subtitle: 'Active portal links',
      icon: Link01Icon,
      accent: 'text-purple-400',
    },
    {
      title: 'GitHub Repos',
      value: s.githubReposCount,
      subtitle: 'Connected codebases',
      icon: GithubIcon,
      accent: 'text-white',
    },
    {
      title: 'Deployments',
      value: s.deploymentsCount,
      subtitle: 'Environment builds',
      icon: CloudIcon,
      accent: 'text-emerald-400',
    },
    {
      title: 'Documents',
      value: s.documentsCount,
      subtitle: 'Specs & READMEs',
      icon: File01Icon,
      accent: 'text-cyan-400',
    },
    {
      title: 'Vault Storage',
      value: s.vaultStorage,
      subtitle: 'Encrypted storage',
      icon: GlobalIcon,
      accent: 'text-amber-400',
    },
    {
      title: 'Timeline Log',
      value: s.timelineEntriesCount,
      subtitle: 'Recorded updates',
      icon: Clock01Icon,
      accent: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono select-none">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.02 }}
          className="p-3 rounded-sm bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-sm space-y-1 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 truncate">{card.title}</span>
            <HugeiconsIcon icon={card.icon} size={14} className={`${card.accent} group-hover:scale-110 transition-transform`} />
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              {card.value}
            </span>
          </div>

          <p className="text-[8px] text-zinc-500 font-sans truncate">{card.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
};
