import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { useClientDocuments } from '../../../../lib/supabase/queries/clients';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';
import { Badge } from '../../../../components/ui/badge';
import { MarkdownPreview } from '../../../projects/components/MarkdownPreview';

interface DocumentationTabProps {
  clientId: string;
}

export const DocumentationTab: React.FC<DocumentationTabProps> = ({ clientId }) => {
  const { data: docs, isLoading } = useClientDocuments(clientId, true);
  const docList = docs || [];
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const activeDoc = docList.find((d: any) => d.id === selectedDocId) || (docList.length > 0 ? docList[0] : null);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : docList.length === 0 ? (
        <ProjectEmptyState title="No Documentation Found" description="No technical documentation or README specs uploaded for client projects." icon={File01Icon} />
      ) : (
        <div className="space-y-4">
          {/* Document Switcher Header Bar */}
          <div className="flex items-center gap-2 p-2 rounded-sm bg-zinc-900/90 border border-zinc-800 overflow-x-auto custom-scrollbar shadow-sm">
            <span className="text-[10px] uppercase font-bold text-zinc-500 px-2 shrink-0">Select Document:</span>
            {docList.map((doc: any) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-bold text-xs transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <HugeiconsIcon icon={File01Icon} size={13} className={isSelected ? 'text-cyan-400' : 'text-zinc-500'} />
                  <span>{doc.title}</span>
                  <Badge variant="outline" className="rounded-sm bg-zinc-950 text-cyan-300 border-cyan-800/80 text-[9px] px-1 py-0 uppercase">
                    {doc.doc_type || 'spec'}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Inline Page Reader Container */}
          {activeDoc && (
            <div className="p-5 sm:p-6 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm min-h-[550px]">
              {/* Document Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{activeDoc.title}</h2>
                    <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] font-bold uppercase">
                      {activeDoc.doc_type || 'readme'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Project: <strong className="text-zinc-200 font-mono">{activeDoc.projectName}</strong> — Version v{activeDoc.version || 1}.0
                  </p>
                </div>

                <span className="text-[10px] text-zinc-500 font-mono">
                  Updated: {new Date(activeDoc.updated_at || activeDoc.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Inline Markdown Reader Body */}
              <div className="p-4 sm:p-5 rounded-sm bg-zinc-950/90 border border-zinc-800/90 text-zinc-200 font-sans min-h-[420px] max-h-[750px] overflow-y-auto custom-scrollbar shadow-inner">
                <MarkdownPreview content={activeDoc.content || `# ${activeDoc.title}\n\nNo detailed documentation content logged.`} />
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
