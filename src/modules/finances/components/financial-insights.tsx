import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon, MoneyBagIcon, TrendingUpDownIcon, Clock01Icon, CreditCardIcon } from '@hugeicons/core-free-icons';

interface FinancialInsightsProps {
  summary: any;
  currency?: string;
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({ summary, currency = 'INR' }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val || 0);

  const pct = summary?.paymentPercentage || 0;
  const remaining = summary?.remainingBalance || 0;
  const avg = summary?.averagePayment || 0;
  const max = summary?.largestPayment || 0;

  const insights = [
    {
      title: `${pct}% Contract Paid`,
      subtitle: remaining > 0 ? `Final settlement pending` : 'Contract fully settled',
      value: formatCurrency(summary?.totalPaid || 0),
      accent: 'text-emerald-400',
      icon: CheckmarkBadge01Icon,
    },
    {
      title: 'Average Payment',
      subtitle: `${summary?.paymentsCount || 0} verified entries`,
      value: formatCurrency(avg),
      accent: 'text-cyan-400',
      icon: CreditCardIcon,
    },
    {
      title: 'Largest Single Payment',
      subtitle: 'Highest single transaction',
      value: formatCurrency(max),
      accent: 'text-purple-400',
      icon: MoneyBagIcon,
    },
    {
      title: 'Collection Rate',
      subtitle: 'Milestone collection velocity',
      value: `${pct}% Rate`,
      accent: 'text-blue-400',
      icon: TrendingUpDownIcon,
    },
    {
      title: 'Remaining Balance',
      subtitle: remaining > 0 ? 'Pending invoice balance' : 'Zero balance',
      value: formatCurrency(remaining),
      accent: 'text-amber-400',
      icon: Clock01Icon,
    },
  ];

  return (
    <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 sm:space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <span className="font-bold text-white text-xs">Automated Financial Insights & Intelligence</span>
        <span className="text-[10px] text-zinc-500 font-sans font-normal">Realtime Analytics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {insights.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1.5 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-bold text-white truncate">{item.title}</span>
              <HugeiconsIcon icon={item.icon} size={13} className={`${item.accent} shrink-0`} />
            </div>

            <span className={`text-sm sm:text-base font-extrabold ${item.accent} block truncate`}>{item.value}</span>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 font-sans leading-tight truncate">{item.subtitle}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
