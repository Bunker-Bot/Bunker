import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkBadge01Icon,
  Calendar01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Flag01Icon,
  Task01Icon,
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface ClientMilestoneCardsProps {
  milestones: any[];
  onNavigateModule?: (id: string) => void;
}

export const ClientMilestoneCards: React.FC<ClientMilestoneCardsProps> = ({
  milestones,
  onNavigateModule,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(milestones[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (milestones.length === 0) {
    return (
      <div className="p-6 rounded-sm bg-zinc-950/90 border border-zinc-800 text-center text-zinc-500 font-mono text-xs">
        No active milestone checkpoints published for this project yet.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={Flag01Icon} size={18} className="text-cyan-400" />
          <span>Milestone Checkpoints Roadmap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-sans">{milestones.length} Delivery Phases</span>
          {onNavigateModule && (
            <button
              onClick={() => onNavigateModule('timeline')}
              className="text-[11px] text-cyan-400 font-bold hover:underline cursor-pointer"
            >
              Timeline →
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((m, idx) => {
          const isExpanded = expandedId === m.id;
          const isCompleted = (m.progress || 0) === 100;
          const title = m.name || m.title || `Milestone ${idx + 1}`;
          const progress = m.progress || 0;
          const dueDate = m.due_date ? new Date(m.due_date).toLocaleDateString() : 'Active Phase';
          const tasks = Array.isArray(m.deliverables) ? m.deliverables : Array.isArray(m.scope) ? m.scope : [];

          return (
            <div
              key={m.id || idx}
              className={`rounded-sm border transition-all ${
                isCompleted
                  ? 'bg-zinc-900/60 border-emerald-900/40'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(m.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isCompleted
                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-cyan-400'
                  }`}>
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm truncate">{title}</h4>
                      <Badge variant="outline" className={`rounded-sm text-[9px] uppercase font-bold px-1.5 ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      }`}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {m.description || 'Milestone scope and delivery specifications'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-zinc-850 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-sans">
                    <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-zinc-500" />
                    <span>Target: <strong className="text-white font-mono">{dueDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold text-sm font-mono ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {progress}%
                    </span>
                    <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={14} className="text-zinc-400" />
                  </div>
                </div>
              </div>

              {/* Expandable Scope Breakdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-zinc-850 bg-zinc-950/80 p-4 space-y-3 font-sans text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <HugeiconsIcon icon={Task01Icon} size={13} className="text-cyan-400" />
                        Scope Checklist ({tasks.length > 0 ? tasks.length : 'Core Phase'})
                      </span>
                      <span>Phase Progress</span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full rounded-sm ${isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {tasks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {tasks.map((task: any, tIdx: number) => (
                          <div key={tIdx} className="flex items-center gap-2 p-2 rounded-sm bg-zinc-900/90 border border-zinc-850 text-zinc-300">
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={13} className={isCompleted ? 'text-emerald-400' : 'text-zinc-600'} />
                            <span className="text-xs truncate">{typeof task === 'string' ? task : task.name || task.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-xs py-1">
                        Milestone active in primary project roadmap. Review updates in Timeline feed.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ClientMilestoneCards;
