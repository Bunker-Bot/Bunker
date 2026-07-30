import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon, MoneyBagIcon, CheckmarkCircle02Icon, Alert02Icon } from '@hugeicons/core-free-icons';

interface ClientPaymentWidgetProps {
  remainingAmount: number;
  totalBudget: number;
  currencySymbol: string;
  onOpenPaymentModal: () => void;
}

export const ClientPaymentWidget: React.FC<ClientPaymentWidgetProps> = ({
  remainingAmount,
  totalBudget,
  currencySymbol,
  onOpenPaymentModal,
}) => {
  const paidAmount = Math.max(0, totalBudget - remainingAmount);
  const paymentPct = totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 100;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (paymentPct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={MoneyBagIcon} size={18} className="text-amber-400" />
          <span>Payment & Deliverables Unlock Portal</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-sans">
          {remainingAmount === 0 ? 'Fully Cleared' : 'Invoices Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Donut Gauge & Summary (5 cols) */}
        <div className="md:col-span-5 p-4 rounded-sm bg-zinc-900/90 border border-zinc-850 flex items-center gap-5">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-zinc-800 stroke-current"
                strokeWidth="7"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                className="text-amber-400 stroke-current"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1 }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold text-white">{paymentPct}%</span>
              <span className="text-[7px] uppercase tracking-widest text-zinc-500 font-sans">Paid</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 font-sans block uppercase font-bold">Total Agreed Budget</span>
              <strong className="text-white font-extrabold text-sm">{currencySymbol}{totalBudget.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-sans block uppercase font-bold">Cleared Paid Amount</span>
              <strong className="text-emerald-400 font-extrabold">{currencySymbol}{paidAmount.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Right Status / Warning Card (7 cols) */}
        <div className="md:col-span-7 p-4 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-3">
          {remainingAmount > 0 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-amber-300 bg-amber-950/40 border border-amber-900/60 p-3 rounded-sm">
                <HugeiconsIcon icon={Alert02Icon} size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">Deliverable Unlock Threshold: 75% Payment Required</h4>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    Current payment status is <strong>{paymentPct}%</strong>. Complete the remaining balance of{' '}
                    <strong className="text-amber-300">{currencySymbol}{remainingAmount.toLocaleString()}</strong> to automatically unlock source packages and production deliverables.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenPaymentModal}
                className="w-full py-2.5 px-4 rounded-sm bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-zinc-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <HugeiconsIcon icon={LockKeyIcon} size={15} />
                <span>Complete Payment & Unlock Deliverables</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-900/60 p-4 rounded-sm text-emerald-300">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} className="text-emerald-400 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs">100% Payment Cleared</h4>
                <p className="text-[11px] text-zinc-300 font-sans">
                  All invoices settled. All deliverables, source code packages, and documentation are fully unlocked for download.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClientPaymentWidget;
