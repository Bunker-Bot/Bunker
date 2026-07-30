import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ActivityIcon, Clock01Icon } from '@hugeicons/core-free-icons';
import { useClientActivity } from '../../../../lib/supabase/queries/clients';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';
import { CollapsibleMarkdown } from '../../../projects/components/CollapsibleMarkdown';

interface ActivityTabProps {
  clientId: string;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ clientId }) => {
  const { data: activities, isLoading } = useClientActivity(clientId, true);
  const items = activities || [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ProjectEmptyState title="No Unified Activity Logged" description="Unified activity feed will track edits, documentation changes, deployments, and share links." icon={ActivityIcon} />
      ) : (
        <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm min-h-[500px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <HugeiconsIcon icon={ActivityIcon} size={14} className="text-cyan-400" />
              <span>Unified Client Operational Activity Feed ({items.length})</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans">Real-time Event Stream</span>
          </div>

          <div className="space-y-3">
            {items.map((act: any) => (
              <div key={act.id} className="flex items-start gap-3 p-3.5 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-750 transition-colors">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm truncate">{act.title}</span>
                    <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 shrink-0">
                      <HugeiconsIcon icon={Clock01Icon} size={11} />
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-sm bg-zinc-900/80 border border-zinc-800/80 text-zinc-300 font-sans text-xs">
                    <CollapsibleMarkdown content={act.description} maxCollapsedHeight={110} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
