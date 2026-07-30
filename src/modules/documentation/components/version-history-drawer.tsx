import React, { useState } from 'react';
import { useDocumentVersions } from '../../../lib/supabase/queries/documentation';
import type { DocumentVersionItem } from '../../../lib/repositories/document.repository';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  UserIcon,
  RotateLeftIcon,
} from '@hugeicons/core-free-icons';

interface VersionHistoryDrawerProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (documentId: string, versionId: string) => Promise<any>;
  isReadOnly?: boolean;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  documentId,
  isOpen,
  onClose,
  onRestore,
  isReadOnly = false,
}) => {
  const { data: versions = [], isLoading } = useDocumentVersions(isOpen ? documentId : null);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersionItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async (version: DocumentVersionItem) => {
    if (!documentId) return;
    if (window.confirm(`Restore document to Version ${version.version_number}?`)) {
      setIsRestoring(true);
      try {
        await onRestore(documentId, version.id);
        onClose();
      } catch (err) {
        console.error('Failed to restore version:', err);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 font-mono p-0 flex flex-col select-none">
        <SheetHeader className="p-4 border-b border-zinc-800 bg-zinc-900/60">
          <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={Clock01Icon} size={16} className="text-zinc-400" />
            <span>Document Version History</span>
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400">
            Inspect lazy-loaded historical version snapshots and restore previous revisions.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Version List Sidebar */}
          <div className="w-1/2 border-r border-zinc-800 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-zinc-400 space-y-2">
                <RadialSpinner size={20} className="mx-auto" />
                <p>Loading version history...</p>
              </div>
            ) : versions.length > 0 ? (
              versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3 rounded border text-xs cursor-pointer transition-colors space-y-1.5 ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs">
                        v{ver.version_number}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(ver.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 line-clamp-2">
                      {ver.change_summary || 'No change summary'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={UserIcon} size={10} />
                        <span>{ver.created_by || 'Administrator'}</span>
                      </span>

                      {!isReadOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(ver);
                          }}
                          disabled={isRestoring}
                          className="text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <HugeiconsIcon icon={RotateLeftIcon} size={10} />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-zinc-500 text-xs font-mono">
                No historical versions found.
              </div>
            )}
          </div>

          {/* Version Content Preview Pane */}
          <div className="w-1/2 p-3 overflow-y-auto bg-zinc-900/40 text-xs font-mono">
            {selectedVersion ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-white">Preview v{selectedVersion.version_number}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleRestore(selectedVersion)}
                      disabled={isRestoring}
                      className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <HugeiconsIcon icon={RotateLeftIcon} size={12} />
                      <span>Restore This Version</span>
                    </button>
                  )}
                </div>

                <pre className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedVersion.content}
                </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-zinc-500 text-xs p-4">
                Select a version from the left panel to preview historical markdown content.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
