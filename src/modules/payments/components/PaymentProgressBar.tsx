import React from 'react';
import { motion } from 'framer-motion';
import type { PaymentSummaryStats } from '../types/payment';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, LockKeyIcon } from '@hugeicons/core-free-icons';

interface PaymentProgressBarProps {
  stats: PaymentSummaryStats;
  currency?: string;
}

const MILESTONES = [
  { percent: 20, label: 'First Payment (25%)' },
  { percent: 40, label: 'Progress (40%)' },
  { percent: 60, label: 'Halfway (50%+)' },
  { percent: 80, label: 'Pre-Release (75%+)' },
  { percent: 100, label: 'Full Unlock (100%)' },
];

export const PaymentProgressBar: React.FC<PaymentProgressBarProps> = ({
  stats,
  currency = 'INR',
}) => {
  const percentage = Math.min(100, Math.max(0, stats.paymentPercentage));
  const isFullyPaid = stats.remainingBalance <= 0 || percentage >= 100;

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 font-mono space-y-4 shadow-sm select-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-sans">Payment Progression</h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                isFullyPaid
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isFullyPaid ? 'Fully Paid' : `${stats.paymentPercentage}% Paid`}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isFullyPaid
              ? 'All deliverables fully unlocked'
              : `${formatAmount(stats.remainingBalance)} remaining to unlock all final deliverables`}
          </p>
        </div>

        {/* Amount Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-zinc-500">Paid</div>
            <div className="font-bold text-emerald-400">{formatAmount(stats.totalPaid)}</div>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="text-right">
            <div className="text-[10px] text-zinc-500">Remaining</div>
            <div className="font-bold text-amber-400">{formatAmount(stats.remainingBalance)}</div>
          </div>
        </div>
      </div>

      {/* Bar Container */}
      <div className="space-y-2">
        <div className="relative h-3 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isFullyPaid
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-zinc-500 via-zinc-400 to-emerald-500'
            }`}
          />
        </div>

        {/* Milestone Threshold Nodes */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {MILESTONES.map((m) => {
            const reached = percentage >= m.percent;
            return (
              <div key={m.percent} className="flex flex-col items-center text-center space-y-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-colors ${
                    reached
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                  }`}
                >
                  {reached ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                  ) : (
                    <span>{m.percent}%</span>
                  )}
                </div>
                <span
                  className={`text-[10px] hidden sm:block truncate max-w-full ${
                    reached ? 'text-zinc-300 font-medium' : 'text-zinc-600'
                  }`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lock status footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={isFullyPaid ? CheckmarkCircle02Icon : LockKeyIcon}
            size={13}
            className={isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}
          />
          <span>
            {isFullyPaid
              ? 'Deliverables unlocked automatically'
              : 'Deliverables locked until payment threshold is reached'}
          </span>
        </div>
        <span className="font-semibold text-zinc-400">{percentage}% Complete</span>
      </div>
    </div>
  );
};
