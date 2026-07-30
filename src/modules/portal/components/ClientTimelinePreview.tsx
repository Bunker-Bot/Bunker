import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

interface ClientTimelinePreviewProps {
  timeline: any[];
  onNavigateTimeline: () => void;
}

function cleanMarkdownExcerpt(text: string, maxLength: number = 100): string {
  if (!text) return '';
  const cleaned = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
}

export const ClientTimelinePreview: React.FC<ClientTimelinePreviewProps> = ({
  timeline,
  onNavigateTimeline,
}) => {
  const recentUpdates = (timeline || []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={Clock01Icon} size={18} className="text-cyan-400" />
          <span>Latest Activity & Delivery Log</span>
        </div>
        <button
          onClick={onNavigateTimeline}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All Timeline</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </button>
      </div>

      {recentUpdates.length === 0 ? (
        <div className="p-6 rounded-sm bg-zinc-900/60 border border-zinc-850 text-center text-zinc-500 font-mono text-xs">
          No recent delivery logs recorded yet. Check back soon for progress updates!
        </div>
      ) : (
        <div className="space-y-3">
          {recentUpdates.map((item, idx) => {
            const dateStr = item.created_at || item.date ? new Date(item.created_at || item.date).toLocaleDateString() : 'Recent';
            const rawTitle = item.title || item.update_text || 'Delivery Progress Update';
            const rawDesc = item.description || item.content || item.notes || 'Milestone phase sync completed successfully.';

            const title = cleanMarkdownExcerpt(rawTitle, 50);
            const desc = cleanMarkdownExcerpt(rawDesc, 110);

            return (
              <div key={item.id || idx} className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-850 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                </div>
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-extrabold text-white text-xs truncate">{title}</h4>
                    <span className="text-[10px] text-zinc-500 font-sans">{dateStr}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ClientTimelinePreview;
