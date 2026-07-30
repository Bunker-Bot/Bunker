import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ActivityIcon,
  CheckmarkBadge01Icon,
  DocumentCodeIcon,
  GitBranchIcon,
  PackageIcon
} from '@hugeicons/core-free-icons';

interface ClientActivityFeedProps {
  milestones: any[];
  docs: any[];
  deliverables: any[];
}

export const ClientActivityFeed: React.FC<ClientActivityFeedProps> = ({
  milestones,
  docs,
  deliverables,
}) => {
  const events = [
    ...milestones.map((m) => ({
      id: `m-${m.id}`,
      type: 'Milestone',
      title: `Milestone Completed: ${m.name || m.title || 'Phase Checkpoint'}`,
      date: m.updated_at || new Date().toISOString(),
      icon: CheckmarkBadge01Icon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/80 border-emerald-800',
    })),
    ...docs.map((d) => ({
      id: `d-${d.id}`,
      type: 'Documentation',
      title: `Document Published: ${d.title || 'Technical Spec'}`,
      date: d.created_at || new Date().toISOString(),
      icon: DocumentCodeIcon,
      color: 'text-purple-400',
      bg: 'bg-purple-950/80 border-purple-800',
    })),
    ...deliverables.map((a) => ({
      id: `a-${a.id}`,
      type: 'Deliverable',
      title: `Asset Uploaded: ${a.title || 'Production Build'}`,
      date: a.created_at || new Date().toISOString(),
      icon: PackageIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-950/80 border-blue-800',
    })),
    {
      id: 'github-sync',
      type: 'CI/CD Pipeline',
      title: 'GitHub Source Telemetry Synchronized',
      date: new Date().toISOString(),
      icon: GitBranchIcon,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/80 border-cyan-800',
    },
  ].slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={ActivityIcon} size={18} className="text-cyan-400" />
          <span>Real-time Workspace Activity Feed</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-sans">Automated Audit Stream</span>
      </div>

      <div className="space-y-3">
        {events.map((ev, idx) => {
          const Icon = ev.icon;
          const dateStr = new Date(ev.date).toLocaleDateString();

          return (
            <div key={ev.id + idx} className="flex items-center justify-between p-3 rounded-sm bg-zinc-900/80 border border-zinc-850">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${ev.bg} ${ev.color} shrink-0`}>
                  <HugeiconsIcon icon={Icon} size={14} />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="font-extrabold text-white text-xs truncate">{ev.title}</h4>
                  <span className="text-[10px] text-zinc-500 font-sans block">{ev.type} Activity Event</span>
                </div>
              </div>

              <span className="text-[10px] text-zinc-400 font-mono shrink-0 pl-2">{dateStr}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ClientActivityFeed;
