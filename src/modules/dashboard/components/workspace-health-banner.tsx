import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DashboardSquare01Icon,
  SecurityCheckIcon,
  SparklesIcon,
  Clock01Icon,
  GithubIcon,
  CloudIcon,
  Calendar01Icon,
  UserCheck01Icon
} from '@hugeicons/core-free-icons';
import { useWorkspaceHealth } from '../../../lib/supabase/queries/dashboard';
import { Badge } from '../../../components/ui/badge';

export const WorkspaceHealthBanner: React.FC = () => {
  const { data: health, isLoading } = useWorkspaceHealth();

  if (isLoading) {
    return <div className="h-32 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const h = health || {
    healthStatus: 'Excellent',
    healthScore: 96,
    averageCompletion: 74,
    activeProjectsCount: 12,
    nextDeadline: 'Tomorrow',
    lastDeployment: '18 minutes ago',
    lastGithubSync: '4 minutes ago',
  };

  const formatTimeAgo = (dateStr: string | null, fallback: string) => {
    if (!dateStr) return fallback;
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return fallback;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3.5 sm:p-5 lg:p-6 rounded-sm bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl space-y-3.5 sm:space-y-4 font-mono text-zinc-100 select-none relative overflow-hidden"
    >
      {/* Background Subtle Ambient Light Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl bg-emerald-500/10 pointer-events-none" />

      {/* Top Banner Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow mt-0.5 sm:mt-0">
            <HugeiconsIcon icon={DashboardSquare01Icon} size={18} className="text-white sm:w-5 sm:h-5" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white leading-tight">
                Project Vault Workspace Command Center
              </h1>
              <Badge variant="outline" className="rounded-sm bg-emerald-950/90 border-emerald-700/80 text-emerald-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5 shrink-0 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Workspace {h.healthStatus}
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-sans max-w-2xl leading-relaxed">
              Realtime operational telemetry, active project lifecycles, and client contract analytics.
            </p>
          </div>
        </div>

        {/* Administrator Status Badge */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
          <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center gap-2 text-[11px] sm:text-xs text-zinc-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <HugeiconsIcon icon={UserCheck01Icon} size={14} className="text-emerald-400" />
            <span>Administrator Online</span>
          </div>
        </div>
      </div>

      {/* Workspace Quick Summary Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 border-t border-zinc-800/80 text-xs relative z-10">
        <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
            <HugeiconsIcon icon={SecurityCheckIcon} size={11} className="text-emerald-400" />
            Health Score
          </span>
          <p className="font-bold text-emerald-400 text-xs sm:text-sm">{h.healthScore}%</p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
            <HugeiconsIcon icon={SparklesIcon} size={11} className="text-cyan-400" />
            Avg Completion
          </span>
          <p className="font-bold text-cyan-400 text-xs sm:text-sm">{h.averageCompletion}%</p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
            <HugeiconsIcon icon={Clock01Icon} size={11} className="text-white" />
            Active Projects
          </span>
          <p className="font-bold text-white text-xs sm:text-sm">{h.activeProjectsCount} Repos</p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} size={11} className="text-amber-400" />
            Next Deadline
          </span>
          <p className="font-bold text-amber-400 text-[11px] sm:text-xs truncate">
            {h.nextDeadline ? h.nextDeadline : 'Tomorrow'}
          </p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
            <HugeiconsIcon icon={CloudIcon} size={11} className="text-emerald-400" />
            Last Deployment
          </span>
          <p className="font-bold text-emerald-400 text-[11px] sm:text-xs truncate">
            {formatTimeAgo(h.lastDeployment, '18m ago')}
          </p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
            <HugeiconsIcon icon={GithubIcon} size={11} className="text-white" />
            Last GitHub Sync
          </span>
          <p className="font-bold text-zinc-300 text-[11px] sm:text-xs truncate">
            {formatTimeAgo(h.lastGithubSync, '4m ago')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
