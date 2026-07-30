import React from 'react';
import type { PaymentSummaryStats } from '../types/payment';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoneyBagIcon,
  CheckmarkCircle02Icon,
  Time01Icon,
  AnalyticsUpIcon,
  Wallet01Icon,
  Tag01Icon,
  Edit01Icon,
} from '@hugeicons/core-free-icons';

interface PaymentAnalyticsCardsProps {
  stats: PaymentSummaryStats;
  currency?: string;
  onEditProjectValue?: () => void;
}

export const PaymentAnalyticsCards: React.FC<PaymentAnalyticsCardsProps> = ({
  stats,
  currency = 'INR',
  onEditProjectValue,
}) => {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {/* Total Project Cost */}
      <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1.5 font-mono group relative">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span>Project Value</span>
          <div className="flex items-center gap-1">
            {onEditProjectValue && (
              <button
                type="button"
                onClick={onEditProjectValue}
                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Edit Total Agreed Project Value"
              >
                <HugeiconsIcon icon={Edit01Icon} size={11} />
              </button>
            )}
            <HugeiconsIcon icon={MoneyBagIcon} size={14} className="text-zinc-500" />
          </div>
        </div>
        <div className="text-lg font-bold text-white tracking-tight">
          {formatAmount(stats.totalCost)}
        </div>
        <div className="text-[10px] text-zinc-500 truncate flex items-center justify-between">
          <span>Agreed project cost</span>
          {onEditProjectValue && (
            <button
              type="button"
              onClick={onEditProjectValue}
              className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
            >
              Set
            </button>
          )}
        </div>
      </div>

      {/* Total Paid */}
      <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span>Amount Paid</span>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-500/80" />
        </div>
        <div className="text-lg font-bold text-emerald-400 tracking-tight">
          {formatAmount(stats.totalPaid)}
        </div>
        <div className="text-[10px] text-emerald-500/70 font-semibold truncate">
          {stats.paymentPercentage}% Collected
        </div>
      </div>

      {/* Remaining Balance */}
      <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span>Remaining</span>
          <HugeiconsIcon icon={Time01Icon} size={14} className="text-amber-500/80" />
        </div>
        <div className="text-lg font-bold text-amber-400 tracking-tight">
          {formatAmount(stats.remainingBalance)}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">Pending balance</div>
      </div>

      {/* Payments Received Count */}
      <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span>Entries</span>
          <HugeiconsIcon icon={Tag01Icon} size={14} className="text-zinc-500" />
        </div>
        <div className="text-lg font-bold text-white tracking-tight">
          {stats.paymentsCount}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">Verified payments</div>
      </div>

      {/* Average Payment */}
      <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span>Avg Payment</span>
          <HugeiconsIcon icon={AnalyticsUpIcon} size={14} className="text-zinc-500" />
        </div>
        <div className="text-lg font-bold text-zinc-200 tracking-tight">
          {formatAmount(stats.averagePayment)}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">Average per transaction</div>
      </div>

      {/* Largest Payment */}
      <div className="p-3.5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span>Largest</span>
          <HugeiconsIcon icon={Wallet01Icon} size={14} className="text-zinc-500" />
        </div>
        <div className="text-lg font-bold text-zinc-200 tracking-tight">
          {formatAmount(stats.largestPayment)}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">Highest single payment</div>
      </div>
    </div>
  );
};
