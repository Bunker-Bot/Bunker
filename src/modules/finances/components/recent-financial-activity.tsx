import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ActivityIcon, CreditCardIcon, LockKeyIcon } from '@hugeicons/core-free-icons';

interface RecentFinancialActivityProps {
  payments: any[];
  assets: any[];
}

export const RecentFinancialActivity: React.FC<RecentFinancialActivityProps> = ({ payments, assets }) => {
  const events = [
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      type: 'payment',
      title: `Payment Recorded: ₹${p.amount?.toLocaleString() || 0}`,
      subtitle: `Method: ${p.paymentMethod} • Transaction ID: ${p.transactionId || 'N/A'}`,
      date: p.paymentDate || p.createdAt,
      icon: CreditCardIcon,
      accent: 'text-emerald-400',
    })),
    ...assets.filter((a) => a.isUnlocked).map((a) => ({
      id: `asset-${a.id}`,
      type: 'asset',
      title: `Deliverable Released: ${a.title}`,
      subtitle: `Type: ${a.assetType} • Threshold: ${a.unlockType}`,
      date: a.updatedAt || a.createdAt,
      icon: LockKeyIcon,
      accent: 'text-blue-400',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-xs">
          <HugeiconsIcon icon={ActivityIcon} size={15} className="text-amber-400" />
          <span>Recent Financial & Delivery Activity ({events.length})</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-sans">Realtime Stream</span>
      </div>

      {events.length === 0 ? (
        <div className="p-6 rounded bg-zinc-950 border border-zinc-850 text-center text-zinc-500 text-xs">
          No financial activity recorded yet.
        </div>
      ) : (
        <div className="relative border-l border-zinc-800 ml-3 pl-4 space-y-3">
          {events.map((ev, idx) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1"
            >
              <span className="absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-zinc-950" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={ev.icon} size={13} className={ev.accent} />
                  <span className="font-bold text-white text-xs">{ev.title}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {ev.date ? new Date(ev.date).toLocaleString() : '—'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans pl-5">{ev.subtitle}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
