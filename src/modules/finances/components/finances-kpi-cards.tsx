import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoneyBagIcon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  InvoiceIcon,
  CreditCardIcon,
  PackageIcon
} from '@hugeicons/core-free-icons';

interface FinancesKpiCardsProps {
  summary: any;
  paymentsCount: number;
  assetsCount: number;
  unlockedAssetsCount: number;
  currency?: string;
  onEditProjectValue?: () => void;
}

export const FinancesKpiCards: React.FC<FinancesKpiCardsProps> = ({
  summary,
  paymentsCount,
  assetsCount,
  unlockedAssetsCount,
  currency = 'INR',
  onEditProjectValue,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val || 0);

  const lockedAssetsCount = Math.max(0, assetsCount - unlockedAssetsCount);

  const cards = [
    {
      title: 'Project Value',
      value: formatCurrency(summary?.totalCost || 0),
      subtitle: 'Agreed contract budget',
      accent: 'text-white',
      borderAccent: 'border-zinc-800',
      icon: MoneyBagIcon,
      badge: currency,
      onClick: onEditProjectValue,
    },
    {
      title: 'Amount Collected',
      value: formatCurrency(summary?.totalPaid || 0),
      subtitle: `${summary?.paymentPercentage || 0}% total contract paid`,
      accent: 'text-emerald-400',
      borderAccent: 'border-emerald-950/80',
      icon: CheckmarkBadge01Icon,
      badge: `${summary?.paymentPercentage || 0}% Collected`,
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(summary?.remainingBalance || 0),
      subtitle: summary?.remainingBalance > 0 ? 'Pending milestone balance' : 'Fully Settled',
      accent: 'text-amber-400',
      borderAccent: 'border-amber-950/80',
      icon: Clock01Icon,
      badge: summary?.remainingBalance > 0 ? 'Balance Due' : 'Paid in Full',
    },
    {
      title: 'Invoices Issued',
      value: `${paymentsCount} Invoices`,
      subtitle: `${paymentsCount} verified payments`,
      accent: 'text-cyan-400',
      borderAccent: 'border-cyan-950/80',
      icon: InvoiceIcon,
      badge: 'Active Ledger',
    },
    {
      title: 'Transactions',
      value: formatCurrency(summary?.averagePayment || 0),
      subtitle: `Avg / Max: ${formatCurrency(summary?.largestPayment || 0)}`,
      accent: 'text-purple-400',
      borderAccent: 'border-purple-950/80',
      icon: CreditCardIcon,
      badge: `${paymentsCount} Entries`,
    },
    {
      title: 'Deliverables',
      value: `${unlockedAssetsCount} / ${assetsCount}`,
      subtitle: `${lockedAssetsCount} deliverables locked`,
      accent: 'text-blue-400',
      borderAccent: 'border-blue-950/80',
      icon: PackageIcon,
      badge: `${unlockedAssetsCount} Unlocked`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 font-mono select-none">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          onClick={card.onClick}
          className={`p-3 sm:p-4 rounded-sm bg-zinc-900/90 border ${card.borderAccent} hover:border-zinc-700 transition-all shadow-sm space-y-1.5 sm:space-y-2 group cursor-pointer`}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate">{card.title}</span>
            <HugeiconsIcon icon={card.icon} size={14} className={`${card.accent} group-hover:scale-110 transition-transform shrink-0`} />
          </div>

          <div className="space-y-0.5">
            <span className={`text-base sm:text-xl font-extrabold tracking-tight ${card.accent} block truncate`}>
              {card.value}
            </span>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 font-sans truncate">{card.subtitle}</p>
          </div>

          <div className="pt-1 border-t border-zinc-850 flex items-center justify-between text-[8px] sm:text-[9px]">
            <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-mono font-bold truncate">
              {card.badge}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
