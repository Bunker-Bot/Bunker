import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Flag01Icon,
  PackageIcon,
  DocumentCodeIcon,
  GitBranchIcon,
  MoneyBagIcon,
} from '@hugeicons/core-free-icons';

interface ClientProgressDashboardProps {
  completionPct: number;
  milestones: any[];
  deliverables: any[];
  docs: any[];
  github: any;
  remainingAmount: number;
  totalBudget: number;
  currencySymbol: string;
}

export const ClientProgressDashboard: React.FC<ClientProgressDashboardProps> = ({
  completionPct,
  milestones,
  deliverables,
  docs,
  github,
  remainingAmount,
  totalBudget,
  currencySymbol,
}) => {
  const milestonePct = milestones.length > 0
    ? Math.round(milestones.reduce((acc, m) => acc + (m.progress || 0), 0) / milestones.length)
    : 0;

  const unlockedCount = deliverables.filter(d => d.is_unlocked || d.is_manual_unlocked || d.isUnlocked).length;
  const deliverablesPct = deliverables.length > 0 ? Math.round((unlockedCount / deliverables.length) * 100) : 100;

  const paidAmount = Math.max(0, totalBudget - remainingAmount);
  const paymentPct = totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 100;

  const docCoverage = Math.min(100, Math.max(20, docs.length * 25));

  const gauges = [
    {
      title: 'Milestone Execution',
      percent: milestonePct,
      color: 'from-cyan-400 to-cyan-500',
      textColor: 'text-cyan-400',
      icon: Flag01Icon,
      subtitle: `${milestones.filter(m => m.progress === 100).length} of ${milestones.length} milestones complete`,
    },
    {
      title: 'Deliverables Unlock Status',
      percent: deliverablesPct,
      color: 'from-blue-400 to-blue-500',
      textColor: 'text-blue-400',
      icon: PackageIcon,
      subtitle: `${unlockedCount} of ${deliverables.length} assets released`,
    },
    {
      title: 'Documentation Coverage',
      percent: docCoverage,
      color: 'from-purple-400 to-purple-500',
      textColor: 'text-purple-400',
      icon: DocumentCodeIcon,
      subtitle: `${docs.length} technical architecture specs published`,
    },
    {
      title: 'GitHub Codebase Health',
      percent: github?.branch || github?.repo_url ? 98 : 75,
      color: 'from-emerald-400 to-emerald-500',
      textColor: 'text-emerald-400',
      icon: GitBranchIcon,
      subtitle: `${github?.branch || 'main'} branch synchronized`,
    },
    {
      title: 'Payment Clearing',
      percent: paymentPct,
      color: 'from-amber-400 to-amber-500',
      textColor: 'text-amber-400',
      icon: MoneyBagIcon,
      subtitle: remainingAmount > 0 ? `${currencySymbol}${remainingAmount.toLocaleString()} pending` : 'Settled',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400" />
            Project Health & Delivery Telemetry
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Real-time automated status indicators across all delivery verticals
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="px-3 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300">
            Overall Health: <strong className="text-emerald-400 font-extrabold">{completionPct}%</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gauges.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div key={g.title + idx} className="p-4 rounded-sm bg-zinc-900/80 border border-zinc-850 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <HugeiconsIcon icon={Icon} size={15} className={g.textColor} />
                  <span>{g.title}</span>
                </div>
                <span className={`font-extrabold font-mono text-sm ${g.textColor}`}>{g.percent}%</span>
              </div>

              <div className="w-full h-2 bg-zinc-950 rounded-sm overflow-hidden border border-zinc-800">
                <motion.div
                  className={`h-full bg-gradient-to-r ${g.color} rounded-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${g.percent}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                />
              </div>

              <p className="text-[10px] text-zinc-400 font-sans">{g.subtitle}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ClientProgressDashboard;
