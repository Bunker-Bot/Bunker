import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { MarkdownPreview } from '../../../modules/projects/components/MarkdownPreview';
import { MilestonesTab } from '../../../modules/milestones/milestones-tab';

interface PortalTimelineViewProps {
  timeline: any[];
  projectId?: string;
}

export const PortalTimelineView: React.FC<PortalTimelineViewProps> = ({ timeline, projectId = '' }) => {
  const updates = timeline || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-mono text-xs select-none overflow-x-hidden"
    >
      {/* Enterprise Milestones Roadmap Component (Read-Only Client Portal) */}
      <MilestonesTab projectId={projectId} readonly={true} />

      {/* Published Changelog Timeline Updates */}
      {updates.length > 0 && (
        <div className="p-4 sm:p-5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <HugeiconsIcon icon={Clock01Icon} size={15} className="text-cyan-400" />
              <span>Published Delivery Changelogs & Notes ({updates.length})</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans">Newest First</span>
          </div>

          <div className="relative border-l border-zinc-800 ml-3 pl-4 space-y-4">
            {updates.map((item, idx) => {
              const bodyText = item.content || item.notes || item.description || '';
              const updateDate = item.created_at || item.entry_date || item.entryDate;

              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative p-4 sm:p-5 rounded-sm bg-zinc-900/60 border border-zinc-850 space-y-3 shadow-sm"
                >
                  <span className="absolute -left-[21px] top-5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-zinc-950" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-850 pb-2">
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {item.title || item.name || 'Timeline Update'}
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {updateDate ? new Date(updateDate).toLocaleString() : ''}
                    </span>
                  </div>

                  {bodyText ? (
                    <div className="pt-1 font-sans text-xs text-zinc-300 leading-relaxed">
                      <MarkdownPreview content={bodyText} compact />
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PortalTimelineView;
