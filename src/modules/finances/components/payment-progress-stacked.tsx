import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockIcon, LockKeyIcon } from '@hugeicons/core-free-icons';

interface PaymentProgressStackedProps {
  summary: any;
  currency?: string;
}

export const PaymentProgressStacked: React.FC<PaymentProgressStackedProps> = ({ summary, currency = 'INR' }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val || 0);

  const pct = summary?.paymentPercentage || 0;
  const totalPaid = summary?.totalPaid || 0;
  const remaining = summary?.remainingBalance || 0;

  const milestones = [
    { label: 'Advance Kickoff', threshold: 25 },
    { label: 'Design Phase', threshold: 50 },
    { label: 'Development Pre-Release', threshold: 75 },
    { label: 'Final Unlock', threshold: 100 },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Contract Collection & Deliverable Progress</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
              {pct}% Paid
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            {remaining > 0
              ? `${formatCurrency(remaining)} remaining to unlock 100% final client deliverables`
              : 'All final project deliverables unlocked & released'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Collected: <strong className="text-emerald-400 font-mono">{formatCurrency(totalPaid)}</strong></span>
          <span>Remaining: <strong className="text-amber-400 font-mono">{formatCurrency(remaining)}</strong></span>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="space-y-2">
        <div className="relative w-full h-4 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800 flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm"
          />
          <div
            className="h-full bg-zinc-800/80 transition-all"
            style={{ width: `${100 - pct}%` }}
          />
        </div>

        {/* Milestone Threshold Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {milestones.map((m) => {
            const isUnlocked = pct >= m.threshold;
            return (
              <div
                key={m.label}
                className={`p-2.5 rounded border text-[11px] transition-all space-y-1 ${
                  isUnlocked
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[10px] uppercase">{m.label} ({m.threshold}%)</span>
                  <HugeiconsIcon
                    icon={isUnlocked ? LockKeyIcon : LockIcon}
                    size={13}
                    className={isUnlocked ? 'text-emerald-400' : 'text-zinc-500'}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block font-sans">
                  {isUnlocked ? 'Unlocked' : `Requires ${m.threshold}% payment`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
