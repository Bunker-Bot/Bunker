import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LockKeyIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Calendar01Icon,
  UserIcon,
  ArrowUp02Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { AppLogo } from '../../../components/ui/AppLogo';

interface ClientHeroProps {
  project: any;
  completionPct: number;
  totalMilestones: number;
  completedMilestones: number;
  remainingAmount: number;
  currencySymbol: string;
  onOpenPaymentModal?: () => void;
}

export const ClientHero: React.FC<ClientHeroProps> = ({
  project,
  completionPct,
  totalMilestones,
  completedMilestones,
  remainingAmount,
  currencySymbol,
  onOpenPaymentModal,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  const status = project?.status || 'Active';
  const clientName =
    (project?.client_name && project.client_name !== 'Valued Client' ? project.client_name : null) ||
    (project?.clientName && project.clientName !== 'Valued Client' ? project.clientName : null) ||
    project?.client?.name ||
    project?.client?.company ||
    project?.share_link?.client_name ||
    project?.client_name ||
    'Valued Client';
  const updatedDate = project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : new Date().toLocaleDateString();
  const estimatedDelivery = project?.due_date || project?.target_date || 'Q3 2026';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-sm bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none p-5 sm:p-7"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Info Column */}
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <AppLogo size={24} showText={false} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
                  {project?.name || 'Client Review Portal'}
                </h1>
                <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] uppercase font-bold tracking-wider shrink-0 px-2 py-0.5">
                  {status}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-sans flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-zinc-300">
                  <HugeiconsIcon icon={UserIcon} size={12} className="text-zinc-500" />
                  {clientName}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">Enterprise Workspace</span>
              </p>
            </div>
          </div>

          {/* Key Dates Meta */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-sans text-zinc-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-zinc-900/80 border border-zinc-850">
              <HugeiconsIcon icon={Clock01Icon} size={13} className="text-cyan-400" />
              <span>Last Activity: <strong className="text-white font-mono">{updatedDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-zinc-900/80 border border-zinc-850">
              <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-emerald-400" />
              <span>Est. Delivery: <strong className="text-white font-mono">{estimatedDelivery}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-zinc-900/80 border border-zinc-850">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-sky-400" />
              <span>Checkpoints: <strong className="text-white font-mono">{completedMilestones}/{totalMilestones} Completed</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: Dual Progress Gauge Ring + Linear Progress */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-sm bg-zinc-950/80 border border-zinc-850 shrink-0 shadow-xl">
          {/* SVG Progress Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-zinc-850 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className="text-emerald-400 stroke-current"
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-white tracking-tighter">{completionPct}%</span>
              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-sans font-bold">Complete</span>
            </div>
          </div>

          {/* Progress Breakdown Text & Pay Action */}
          <div className="space-y-2.5 text-center sm:text-left min-w-[180px]">
            <div>
              <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400 mb-1">
                <span>Overall Delivery Health</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                  <HugeiconsIcon icon={ArrowUp02Icon} size={12} />
                  Optimal
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500 rounded-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {remainingAmount > 0 && onOpenPaymentModal && (
              <button
                onClick={onOpenPaymentModal}
                className="w-full py-1.5 px-3 rounded-sm bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-zinc-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-all"
              >
                <HugeiconsIcon icon={LockKeyIcon} size={13} />
                <span>Pay {currencySymbol}{remainingAmount.toLocaleString()} Balance</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ClientHero;
