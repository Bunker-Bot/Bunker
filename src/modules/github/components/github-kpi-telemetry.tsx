import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  CheckmarkBadge01Icon,
  Link01Icon,
  GitPullRequestIcon,
  AlertCircleIcon,
  PlayIcon,
  Clock01Icon,
  Tag01Icon,
  GitCommitIcon
} from '@hugeicons/core-free-icons';

interface GithubKpiTelemetryProps {
  repositories: any[];
  telemetry?: any;
}

export const GithubKpiTelemetry: React.FC<GithubKpiTelemetryProps> = ({ repositories, telemetry }) => {
  const totalRepos = repositories.length;
  const privateRepos = repositories.filter((r) => r.visibility === 'private').length;
  const publicRepos = repositories.filter((r) => r.visibility === 'public').length;
  const openPrs = repositories.reduce((acc, r) => acc + (r.open_prs || 0), 0);
  const openIssues = repositories.reduce((acc, r) => acc + (r.open_issues || 0), 0);
  const orgsCount = new Set(repositories.map((r) => r.organization).filter(Boolean)).size;
  const commitsCount = telemetry?.commits?.length || 0;
  const workflowsCount = telemetry?.workflows?.length || 0;
  const contributorsCount = telemetry?.contributors?.length || 0;
  const syncDuration = telemetry?.durationMs ? `${telemetry.durationMs}ms` : '—';

  const cards = [
    { title: 'Repositories', value: totalRepos, icon: GithubIcon, accent: 'text-white' },
    { title: 'Organizations', value: orgsCount, icon: CheckmarkBadge01Icon, accent: 'text-cyan-400' },
    { title: 'Public', value: publicRepos, icon: Link01Icon, accent: 'text-cyan-300' },
    { title: 'Private', value: privateRepos, icon: CheckmarkBadge01Icon, accent: 'text-emerald-400' },
    { title: 'Commits', value: commitsCount, icon: GitCommitIcon, accent: 'text-white' },
    { title: 'Open PRs', value: openPrs, icon: GitPullRequestIcon, accent: 'text-amber-400' },
    { title: 'Open Issues', value: openIssues, icon: AlertCircleIcon, accent: 'text-rose-400' },
    { title: 'Workflows', value: workflowsCount, icon: PlayIcon, accent: 'text-cyan-400' },
    { title: 'Contributors', value: contributorsCount, icon: Tag01Icon, accent: 'text-emerald-300' },
    { title: 'Sync Time', value: syncDuration, icon: Clock01Icon, accent: 'text-zinc-400' },
  ];

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5 font-mono select-none">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.02 }}
          className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-sm space-y-1 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-400 truncate">{card.title}</span>
            <HugeiconsIcon icon={card.icon} size={12} className={`${card.accent} group-hover:scale-110 transition-transform shrink-0`} />
          </div>

          <div className="pt-0.5">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              {card.value}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
