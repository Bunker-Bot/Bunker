import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { DocumentCodeIcon, ArrowRight01Icon, Book01Icon } from '@hugeicons/core-free-icons';

interface ClientDocumentationGridProps {
  docs: any[];
  onNavigateDocs: () => void;
}

function cleanMarkdownExcerpt(text: string, maxLength: number = 90): string {
  if (!text) return '';
  const cleaned = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
}

export const ClientDocumentationGrid: React.FC<ClientDocumentationGridProps> = ({
  docs,
  onNavigateDocs,
}) => {
  const docItems = (docs || []).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={DocumentCodeIcon} size={18} className="text-purple-400" />
          <span>Technical Architecture & Documentation</span>
        </div>
        <button
          onClick={onNavigateDocs}
          className="text-xs text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Documentation Hub</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </button>
      </div>

      {docItems.length === 0 ? (
        <div className="p-6 rounded-sm bg-zinc-900/60 border border-zinc-850 text-center text-zinc-500 font-mono text-xs">
          No technical documentation published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docItems.map((doc, idx) => {
            const cleanTitle = cleanMarkdownExcerpt(doc.title || 'Technical Spec', 40);
            const cleanBody = cleanMarkdownExcerpt(doc.content || 'Project specification manual.', 100);

            return (
              <div
                key={doc.id || idx}
                onClick={onNavigateDocs}
                className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-850 hover:border-purple-500/50 hover:bg-zinc-900 transition-all cursor-pointer space-y-2 group shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-sm bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={Book01Icon} size={15} />
                  </div>
                  <span className="text-[9px] font-sans uppercase font-bold text-zinc-500">
                    {doc.category || 'Architecture'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-white text-xs truncate">{cleanTitle}</h4>
                  <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 mt-0.5 leading-relaxed">
                    {cleanBody}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] text-purple-400 font-bold">
                  <span>Read Manual</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ClientDocumentationGrid;
