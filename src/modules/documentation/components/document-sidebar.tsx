import React, { useState, useMemo } from 'react';
import type { DocumentItem, DocumentCategory } from '../../../lib/repositories/document.repository';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Badge } from '../../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FileCodeIcon,
  Search01Icon,
  PlusSignIcon,
  StarIcon,
  EyeIcon,
  LockIcon,
  Folder01Icon,
  Book01Icon,
  Layout01Icon,
  Upload01Icon,
  DatabaseIcon,
  ApiIcon,
  UserGroupIcon,
  Settings01Icon,
  File01Icon,
} from '@hugeicons/core-free-icons';

interface DocumentSidebarProps {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onOpenCreate: () => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

export const getCategoryIcon = (category: DocumentCategory) => {
  switch (category) {
    case 'Getting Started':
      return Book01Icon;
    case 'Development':
      return FileCodeIcon;
    case 'Backend':
      return Folder01Icon;
    case 'Frontend':
      return Layout01Icon;
    case 'Deployment':
      return Upload01Icon;
    case 'Architecture':
      return Folder01Icon;
    case 'Database':
      return DatabaseIcon;
    case 'API':
      return ApiIcon;
    case 'Client':
      return UserGroupIcon;
    case 'Operations':
      return Settings01Icon;
    case 'General':
    default:
      return FileCodeIcon;
  }
};

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onOpenCreate,
  onToggleFavorite,
  isReadOnly = false,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Getting Started': true,
    'Development': true,
    'Backend': true,
    'Frontend': true,
    'Architecture': true,
    'General': true,
  });

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // If read only (share portal), only client-visible docs
      if (isReadOnly && !doc.is_client_visible) return false;

      if (favoritesOnly && !doc.is_favorite) return false;

      if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;

      if (search.trim()) {
        const query = search.toLowerCase().trim();
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query) ||
          doc.doc_type.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [documents, isReadOnly, favoritesOnly, selectedCategory, search]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const map: Record<string, DocumentItem[]> = {};

    filteredDocuments.forEach((doc) => {
      const cat = doc.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(doc);
    });

    return map;
  }, [filteredDocuments]);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border-r border-zinc-800/80 font-mono select-none overflow-hidden">
      {/* 1. Header & Quick Actions */}
      <div className="p-3.5 border-b border-zinc-800/80 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Book01Icon} size={16} className="text-zinc-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Knowledge Base
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-800 text-zinc-300">
              {filteredDocuments.length}
            </Badge>
          </div>

          {!isReadOnly && (
            <button
              onClick={onOpenCreate}
              className="p-1 rounded bg-white hover:bg-zinc-200 text-black cursor-pointer shadow-sm transition-colors"
              title="Create New Document"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-[11px] outline-none focus:border-zinc-700"
          />
        </div>

        {/* Quick Category / Favorite Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            All ({documents.length})
          </button>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              favoritesOnly
                ? 'bg-amber-950/80 border border-amber-800 text-amber-300 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <HugeiconsIcon icon={StarIcon} size={10} className={favoritesOnly ? 'text-amber-400 fill-amber-400' : ''} />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Document Hierarchy Tree */}
      <ScrollArea className="flex-1 p-2 space-y-3">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-zinc-900 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : Object.keys(groupedByCategory).length > 0 ? (
          Object.entries(groupedByCategory).map(([categoryName, docList]) => {
            const CatIcon = getCategoryIcon(categoryName as DocumentCategory);
            const isExpanded = expandedCategories[categoryName] !== false;

            return (
              <div key={categoryName} className="space-y-1 mb-3">
                {/* Category Header Toggle */}
                <button
                  onClick={() => toggleCategoryExpand(categoryName)}
                  className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-bold text-zinc-400 hover:text-zinc-200 cursor-pointer rounded hover:bg-zinc-900/60"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <HugeiconsIcon icon={CatIcon} size={13} className="text-zinc-500 shrink-0" />
                    <span className="truncate uppercase tracking-wider text-[10px]">{categoryName}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-zinc-900 text-zinc-400">
                    {docList.length}
                  </Badge>
                </button>

                {/* Items in Category */}
                {isExpanded && (
                  <div className="space-y-0.5 pl-2 border-l border-zinc-800/60 ml-3">
                    {docList.map((doc) => {
                      const isSelected = selectedDocumentId === doc.id;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => onSelectDocument(doc.id)}
                          className={`group relative px-2.5 py-1.5 rounded text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-zinc-800/90 text-white font-bold border-l-2 border-cyan-400 shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <HugeiconsIcon
                              icon={doc.is_favorite ? StarIcon : File01Icon}
                              size={13}
                              className={`shrink-0 ${
                                doc.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                              }`}
                            />
                            <span className="truncate text-[11px]" title={doc.title}>
                              {doc.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {doc.version > 1 && (
                              <span className="text-[9px] px-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                                v{doc.version}
                              </span>
                            )}

                            {doc.is_locked && (
                              <span title="Locked">
                                <HugeiconsIcon icon={LockIcon} size={11} className="text-amber-400" />
                              </span>
                            )}

                            {!isReadOnly && doc.is_client_visible && (
                              <span title="Visible to Client">
                                <HugeiconsIcon icon={EyeIcon} size={11} className="text-cyan-400" />
                              </span>
                            )}

                            {!isReadOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(doc.id, !doc.is_favorite);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-amber-400 cursor-pointer transition-opacity"
                                title="Toggle Star"
                              >
                                <HugeiconsIcon icon={StarIcon} size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-zinc-500 text-xs font-mono space-y-2">
            <HugeiconsIcon icon={FileCodeIcon} size={24} className="mx-auto text-zinc-600" />
            <p>No documents found matching filters.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
