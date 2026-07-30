import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useToggleFavorite,
  useToggleClientVisible,
  useRestoreVersion,
} from '../../lib/supabase/queries/documentation';
import { useProjects } from '../../lib/supabase/queries/projects';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import type { DocumentItem } from '../../lib/repositories/document.repository';
import { DocumentSidebar } from './components/document-sidebar';
import { DocumentViewer } from './components/document-viewer';
import { VersionHistoryDrawer } from './components/version-history-drawer';
import { DocumentFormDrawer } from './components/document-form-drawer';
import { PageHeader } from '../../../packages/ui/src/components/page-header';
import { Select } from '../../../packages/ui/src/components/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FileCodeIcon,
  PlusSignIcon,
  Book01Icon,
} from '@hugeicons/core-free-icons';

interface DocumentationTabProps {
  projectId?: string;
  isReadOnly?: boolean;
}

export const DocumentationTab: React.FC<DocumentationTabProps> = ({
  projectId: initialProjectId,
  isReadOnly = false,
}) => {
  // Project selection state if not bound to single project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Mobile Sidebar Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Resizable Sidebar Width (Stored in localStorage)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('bunker_doc_sidebar_width');
    return saved ? Math.max(220, Math.min(480, Number(saved))) : 280;
  });
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);

  // Drawers state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<DocumentItem | null>(null);

  // Fetch Projects List (for project selector dropdown if needed)
  const { data: projectsResult } = useProjects({ limit: 100 });
  const projects = (projectsResult as any)?.projects || [];

  const projectSelectOptions = useMemo(() => [
    { label: 'All Projects', value: 'all' },
    ...projects.map((p: any) => ({ value: p.id, label: p.name })),
  ], [projects]);

  // Sync initialProjectId if passed
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // Query Documents List (Progressively loaded)
  const { data: docsData, isLoading: isLoadingList } = useDocuments(selectedProjectId, {
    clientVisibleOnly: isReadOnly,
  });
  const documents = docsData?.documents || [];

  // Auto-select first document if none selected
  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      setSelectedDocId(documents[0].id);
    } else if (documents.length === 0) {
      setSelectedDocId(null);
    }
  }, [documents, selectedDocId]);

  // Query Selected Document (Lazily loaded)
  const { data: activeDocument, isLoading: isLoadingDoc } = useDocument(selectedDocId);

  // Realtime subscription for documents table
  useRealtimeSubscription({
    table: 'documents',
    filter: selectedProjectId !== 'all' ? `project_id=eq.${selectedProjectId}` : undefined,
    queryKeyToInvalidate: ['documents'],
  });

  // Mutations
  const createDocMutation = useCreateDocument();
  const updateDocMutation = useUpdateDocument();
  const deleteDocMutation = useDeleteDocument();
  const toggleFavoriteMutation = useToggleFavorite();
  const toggleClientVisibleMutation = useToggleClientVisible();
  const restoreVersionMutation = useRestoreVersion();

  // Next / Previous Navigation Helpers
  const currentIndex = useMemo(() => {
    if (!selectedDocId) return -1;
    return documents.findIndex((d) => d.id === selectedDocId);
  }, [documents, selectedDocId]);

  const handleNavigatePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedDocId(documents[currentIndex - 1].id);
    }
  }, [currentIndex, documents]);

  const handleNavigateNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < documents.length - 1) {
      setSelectedDocId(documents[currentIndex + 1].id);
    }
  }, [currentIndex, documents]);

  // Sidebar Resize Handler
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSidebar) return;
      const newWidth = Math.max(200, Math.min(500, e.clientX - 60));
      setSidebarWidth(newWidth);
      localStorage.setItem('bunker_doc_sidebar_width', String(newWidth));
    };

    const handleMouseUp = () => {
      setIsDraggingSidebar(false);
    };

    if (isDraggingSidebar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSidebar]);

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[550px] max-w-[1700px] mx-auto space-y-3 text-zinc-100 font-mono select-none flex flex-col overflow-hidden">
      {/* 1. Page Header (If standalone page) */}
      {!initialProjectId && (
        <PageHeader
          title="Project Knowledge Base & Specifications"
          description="Structured, version-controlled architecture specs, API guides, and client documentation repository."
          icon={FileCodeIcon}
          badge="GitBook/Notion Engine"
          breadcrumbs={[
            { label: 'Workspace', href: '/app/dashboard' },
            { label: 'Documentation' }
          ]}
          actions={
            <div className="flex items-center gap-3">
              {/* Project Workspace Filter Dropdown */}
              <Select
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                options={projectSelectOptions}
                className="w-48"
              />

              {!isReadOnly && (
                <button
                  onClick={() => {
                    setDocToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0 whitespace-nowrap transition-colors"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={16} />
                  <span>New Document</span>
                </button>
              )}
            </div>
          }
        />
      )}

      {/* Mobile Knowledge Base Sub-Bar Toggle */}
      <div className="lg:hidden shrink-0 flex items-center justify-between gap-2 p-2 bg-zinc-900/90 border border-zinc-800 rounded text-xs font-mono">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2 cursor-pointer"
        >
          <HugeiconsIcon icon={Book01Icon} size={14} className="text-cyan-400" />
          <span>Knowledge Base ({documents.length})</span>
        </button>

        <div className="flex items-center gap-2">
          <Select
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projectSelectOptions}
            className="w-32 text-xs"
          />

          {!isReadOnly && (
            <button
              onClick={() => {
                setDocToEdit(null);
                setIsFormOpen(true);
              }}
              className="p-1.5 rounded bg-white text-black font-bold hover:bg-zinc-200 cursor-pointer"
              title="New Document"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Knowledge Base Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-zinc-950 shadow-2xl border-r border-zinc-800 flex flex-col z-10">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-xs text-white uppercase tracking-wider">Knowledge Base</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentSidebar
                documents={documents}
                selectedDocumentId={selectedDocId}
                onSelectDocument={(id) => {
                  setSelectedDocId(id);
                  setIsMobileSidebarOpen(false);
                }}
                onOpenCreate={() => {
                  setDocToEdit(null);
                  setIsFormOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                onToggleFavorite={(id, isFav) =>
                  toggleFavoriteMutation.mutateAsync({ id, isFavorite: isFav })
                }
                isReadOnly={isReadOnly}
                isLoading={isLoadingList}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Documentation Split Workspace */}
      <div className="flex-1 min-h-0 rounded bg-zinc-950 border border-zinc-800 shadow-2xl flex overflow-hidden relative">
        {/* Left Resizable Sidebar (Desktop) */}
        <div style={{ width: `${sidebarWidth}px` }} className="hidden lg:block shrink-0 h-full overflow-hidden">
          <DocumentSidebar
            documents={documents}
            selectedDocumentId={selectedDocId}
            onSelectDocument={(id) => setSelectedDocId(id)}
            onOpenCreate={() => {
              setDocToEdit(null);
              setIsFormOpen(true);
            }}
            onToggleFavorite={(id, isFav) =>
              toggleFavoriteMutation.mutateAsync({ id, isFavorite: isFav })
            }
            isReadOnly={isReadOnly}
            isLoading={isLoadingList}
          />
        </div>

        {/* Resizer Handle (Desktop) */}
        <div
          onMouseDown={handleMouseDownResize}
          className={`hidden lg:block w-1.5 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-20 shrink-0 ${
            isDraggingSidebar ? 'bg-cyan-400' : 'bg-zinc-800/80'
          }`}
        />

        {/* Right Main Viewer / Editor Pane (Only Center Content Scrolls) */}
        <div className="flex-1 h-full overflow-hidden bg-zinc-950 min-w-0">
          <DocumentViewer
            document={activeDocument || null}
            onUpdate={async (updates, _createNewVersion, changeSummary) => {
              if (selectedDocId) {
                return await updateDocMutation.mutateAsync({
                  id: selectedDocId,
                  updates,
                  changeSummary,
                });
              }
            }}
            onDelete={async (id) => {
              await deleteDocMutation.mutateAsync(id);
              setSelectedDocId(null);
            }}
            onToggleFavorite={(id, isFav) =>
              toggleFavoriteMutation.mutateAsync({ id, isFavorite: isFav })
            }
            onToggleClientVisible={(id, isVis) =>
              toggleClientVisibleMutation.mutateAsync({ id, isClientVisible: isVis })
            }
            onOpenVersions={() => setIsVersionsOpen(true)}
            onNavigatePrev={currentIndex > 0 ? handleNavigatePrev : undefined}
            onNavigateNext={
              currentIndex >= 0 && currentIndex < documents.length - 1
                ? handleNavigateNext
                : undefined
            }
            isReadOnly={isReadOnly}
            isLoading={isLoadingDoc}
          />
        </div>
      </div>

      {/* Form Drawer (Create / Edit Document) */}
      <DocumentFormDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          if (docToEdit) {
            await updateDocMutation.mutateAsync({
              id: docToEdit.id,
              updates: data,
            });
          } else {
            const created = await createDocMutation.mutateAsync(data);
            if (created?.id) {
              setSelectedDocId(created.id);
            }
          }
        }}
        documentToEdit={docToEdit}
        defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined}
      />

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        documentId={selectedDocId}
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        onRestore={async (docId, versionId) => {
          await restoreVersionMutation.mutateAsync({
            documentId: docId,
            versionId,
          });
        }}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default DocumentationTab;
