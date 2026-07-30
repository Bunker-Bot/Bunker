import React from 'react';
import { motion } from 'framer-motion';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { useClientTimeline } from '../../../../lib/supabase/queries/clients';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';
import { CollapsibleMarkdown } from '../../../projects/components/CollapsibleMarkdown';

interface TimelineTabProps {
  clientId: string;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ clientId }) => {
  const { data: timeline, isLoading } = useClientTimeline(clientId, true);
  const items = timeline || [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ProjectEmptyState title="No Timeline Events" description="No project updates or timeline events recorded for this client." icon={Clock01Icon} />
      ) : (
        <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm min-h-[500px]">
          <div className="font-bold text-white text-xs border-b border-zinc-800 pb-2.5 flex items-center justify-between">
            <span>Client Delivery Timeline ({items.length})</span>
            <span className="text-[10px] text-zinc-500 font-sans">Scrollable Timeline Feed</span>
          </div>

          <div className="relative border-l border-zinc-800 ml-3 pl-4 space-y-6">
            {items.map((item: any) => (
              <div key={item.id} className="relative space-y-2">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-zinc-950" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{item.title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="p-4 rounded-sm bg-zinc-950/90 border border-zinc-800/80 text-zinc-300 font-sans text-xs">
                  <CollapsibleMarkdown content={item.description || `Update logged for ${item.projectName}`} maxCollapsedHeight={140} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
