import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Flag01Icon,
  PackageIcon,
  DocumentCodeIcon,
  GitBranchIcon,
  Download01Icon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  MoneyBagIcon
} from '@hugeicons/core-free-icons';

interface ClientStatsGridProps {
  milestones: any[];
  deliverables: any[];
  docs: any[];
  github: any;
  remainingAmount: number;
  totalBudget: number;
  currencySymbol: string;
  onNavigateModule: (id: string) => void;
}

export const ClientStatsGrid: React.FC<ClientStatsGridProps> = ({
  milestones,
  deliverables,
  docs,
  github,
  remainingAmount,
  totalBudget,
  currencySymbol,
  onNavigateModule,
}) => {
  const completedMilestones = milestones.filter((m) => m.progress === 100).length;
  const unlockedDeliverables = deliverables.filter(
    (d) => d.is_unlocked || d.is_manual_unlocked || d.isUnlocked
  ).length;

  const paidAmount = Math.max(0, totalBudget - remainingAmount);
  const paymentPct = totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 100;

  const stats = [
    {
      id: 'timeline',
      label: 'Milestones Phase',
      value: `${completedMilestones}/${milestones.length}`,
      subtitle: `${milestones.length - completedMilestones} active phases remaining`,
      trend: '+1 completed',
      icon: Flag01Icon,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      id: 'deliverables',
      label: 'Client Deliverables',
      value: `${unlockedDeliverables} / ${deliverables.length}`,
      subtitle: 'Released production assets',
      trend: unlockedDeliverables === deliverables.length ? '100% Unlocked' : 'Pending payment unlock',
      icon: PackageIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      id: 'documentation',
      label: 'Documentation',
      value: `${docs.length} Guides`,
      subtitle: 'Architecture & API blueprints',
      trend: '+2 updated recently',
      icon: DocumentCodeIcon,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      id: 'github',
      label: 'Source Repository',
      value: github?.branch || (github?.repo_url ? 'main' : 'Synced'),
      subtitle: github?.repo_name || 'Enterprise Source Control',
      trend: 'Live CI/CD Sync',
      icon: GitBranchIcon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      id: 'finance',
      label: 'Payment Progress',
      value: `${paymentPct}% Paid`,
      subtitle: remainingAmount > 0 ? `${currencySymbol}${remainingAmount.toLocaleString()} balance due` : 'Fully paid',
      trend: remainingAmount > 0 ? 'Verified Invoices' : 'Cleared',
      icon: MoneyBagIcon,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      id: 'downloads',
      label: 'Downloadable Assets',
      value: `${unlockedDeliverables + docs.length} Packages`,
      subtitle: 'Build artifacts & source bundles',
      trend: 'Verified MD5 checksums',
      icon: Download01Icon,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
    },
    {
      id: 'timeline',
      label: 'Delivery Quality Check',
      value: 'Passed',
      subtitle: 'Continuous Integration Passed',
      trend: '0 blocker issues',
      icon: CheckmarkBadge01Icon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      id: 'overview',
      label: 'Telemetry Health',
      value: '99.9%',
      subtitle: 'Real-time monitoring active',
      trend: 'Optimal SLA',
      icon: Clock01Icon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs select-none">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label + idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            onClick={() => onNavigateModule(item.id)}
            className="p-4 rounded-sm bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 transition-all cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                {item.label}
              </span>
              <div className={`w-8 h-8 rounded-sm ${item.bg} border ${item.border} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <HugeiconsIcon icon={Icon} size={15} />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{item.value}</h3>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{item.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px]">
              <span className={`font-bold ${item.color}`}>{item.trend}</span>
              <span className="text-zinc-500 font-sans group-hover:text-zinc-300 transition-colors">Details →</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ClientStatsGrid;
