import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon, Clock01Icon } from '@hugeicons/core-free-icons';

interface PaymentJourneyTimelineProps {
  timeline: any[];
}

export const PaymentJourneyTimeline: React.FC<PaymentJourneyTimelineProps> = ({ timeline }) => {
  const steps = timeline.length > 0 ? timeline : [
    { label: 'Contract Signed', threshold: 0, status: 'paid', description: 'Agreement & Terms Finalized' },
    { label: 'Advance Received', threshold: 25, status: 'paid', description: '25% Kickoff Advance' },
    { label: 'Design Phase', threshold: 50, status: 'pending', description: '50% Design Sign-off' },
    { label: 'Development', threshold: 75, status: 'pending', description: '75% Code Pre-release' },
    { label: 'Testing & QA', threshold: 90, status: 'pending', description: '90% User Acceptance' },
    { label: 'Final Delivery', threshold: 100, status: 'pending', description: '100% Asset Unlock & Handover' },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <span className="font-bold text-white text-xs">Visual Payment & Delivery Milestone Journey</span>
        <span className="text-[10px] text-zinc-500 font-sans">{steps.length} Milestones Tracked</span>
      </div>

      {/* Horizontal Milestone Connector Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const isPaid = step.status === 'paid';
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-3 rounded border space-y-2 relative transition-all ${
                isPaid
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                  : 'bg-zinc-950 border-zinc-850 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                  {idx + 1}
                </span>
                <HugeiconsIcon
                  icon={isPaid ? CheckmarkBadge01Icon : Clock01Icon}
                  size={14}
                  className={isPaid ? 'text-emerald-400' : 'text-zinc-500'}
                />
              </div>

              <div className="space-y-0.5">
                <h4 className="font-bold text-white text-xs truncate">{step.label}</h4>
                <p className="text-[9px] text-zinc-400 font-sans leading-tight">{step.description}</p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[9px] font-bold">
                <span className={isPaid ? 'text-emerald-400' : 'text-zinc-500'}>
                  {isPaid ? 'Verified' : 'Pending'}
                </span>
                <span className="text-zinc-500">{step.threshold}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
