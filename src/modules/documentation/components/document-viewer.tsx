import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { DocumentItem } from '../../../lib/repositories/document.repository';
import { DocumentService } from '../../../lib/services/document.service';
import { MarkdownPreview } from '../../projects/components/MarkdownPreview';
import { MarkdownToolbar } from '../../projects/components/MarkdownToolbar';
import type { TocItem } from '../../projects/components/TableOfContents';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { Badge } from '../../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Edit01Icon,
  FloppyDiskIcon,
  Copy01Icon,
  Download01Icon,
  Clock01Icon,
  UserIcon,
  Book01Icon,
  StarIcon,
  EyeIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Menu01Icon,
  Delete02Icon,
  LockIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

interface DocumentViewerProps {
  document: DocumentItem | null;
  onUpdate: (updates: Partial<DocumentItem>, createNewVersion?: boolean, changeSummary?: string) => Promise<any>;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleClientVisible?: (id: string, isClientVisible: boolean) => void;
  onOpenVersions?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onUpdate,
  onDelete,
  onToggleFavorite,
  onToggleClientVisible,
  onOpenVersions,
  onNavigatePrev,
  onNavigateNext,
  isReadOnly = false,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when document changes
  useEffect(() => {
    if (document) {
      setEditedTitle(document.title || '');
      setEditedContent(document.content || '');
      setIsEditing(false);
    }
  }, [document?.id, document?.title, document?.content]);

  // Word count & Reading time calculations
  const wordCount = useMemo(
    () => DocumentService.calculateWordCount(isEditing ? editedContent : document?.content),
    [isEditing, editedContent, document?.content]
  );

  const readingTime = useMemo(
    () => DocumentService.calculateReadingTime(isEditing ? editedContent : document?.content),
    [isEditing, editedContent, document?.content]
  );

  // Handle Save Update
  const handleSave = async () => {
    if (!document) return;
    setIsSaving(true);
    try {
      await onUpdate(
        {
          title: editedTitle,
          content: editedContent,
        },
        true,
        'Updated document markdown content'
      );
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Markdown Content
  const handleCopyMarkdown = async () => {
    const text = isEditing ? editedContent : document?.content || '';
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download Markdown File
  const handleDownloadMarkdown = () => {
    const text = isEditing ? editedContent : document?.content || '';
    if (!text || !document) return;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toolbar Insert Helper
  const handleInsert = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = editedContent.substring(start, end);
    const replacement = `${prefix}${selection || 'text'}${suffix}`;

    const newContent =
      editedContent.substring(0, start) + replacement + editedContent.substring(end);
    setEditedContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  // Heading scroll spy
  const handleTocScroll = (id: string) => {
    setActiveHeadingId(id);
    const element = window.document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-zinc-950 font-mono text-xs text-zinc-400 space-y-3">
        <RadialSpinner size={24} />
        <p>Loading document specification...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-zinc-950 font-mono text-xs text-zinc-500 space-y-3 text-center">
        <HugeiconsIcon icon={Book01Icon} size={32} className="text-zinc-600" />
        <h3 className="text-sm font-bold text-white">No Document Selected</h3>
        <p className="max-w-xs">Select a document from the left navigation tree to view or edit specifications.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 font-mono text-zinc-100 select-none overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        {/* Title & Metadata Pills */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-white font-bold text-sm outline-none focus:border-cyan-400 flex-1 min-w-[200px]"
              placeholder="Document title..."
            />
          ) : (
            <h2 className="text-sm font-bold text-white truncate" title={document.title}>
              {document.title}
            </h2>
          )}

          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 font-mono border-zinc-700 px-1.5 py-0">
              {document.category}
            </Badge>

            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              v{document.version}
            </span>

            {document.is_locked && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold flex items-center gap-1">
                <HugeiconsIcon icon={LockIcon} size={10} />
                <span>Locked</span>
              </span>
            )}
          </div>
        </div>

        {/* Top Header Controls */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          {!isReadOnly && onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(document.id, !document.is_favorite)}
              className={`p-1.5 rounded cursor-pointer transition-colors border ${
                document.is_favorite
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title={document.is_favorite ? 'Starred' : 'Star Document'}
            >
              <HugeiconsIcon icon={StarIcon} size={14} className={document.is_favorite ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
          )}

          {!isReadOnly && onToggleClientVisible && (
            <button
              onClick={() => onToggleClientVisible(document.id, !document.is_client_visible)}
              className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors border flex items-center gap-1 ${
                document.is_client_visible
                  ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Client Visibility for Share Links"
            >
              <HugeiconsIcon icon={EyeIcon} size={13} />
              <span>{document.is_client_visible ? 'Client Visible' : 'Internal'}</span>
            </button>
          )}

          {!isReadOnly && onOpenVersions && (
            <button
              onClick={onOpenVersions}
              className="px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[11px] font-bold cursor-pointer flex items-center gap-1"
              title="View Version History"
            >
              <HugeiconsIcon icon={Clock01Icon} size={13} />
              <span>History</span>
            </button>
          )}

          <button
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            title="Copy Raw Markdown"
          >
            <HugeiconsIcon icon={isCopied ? Tick01Icon : Copy01Icon} size={14} className={isCopied ? 'text-emerald-400' : ''} />
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            title="Download .md File"
          >
            <HugeiconsIcon icon={Download01Icon} size={14} />
          </button>

          {!isReadOnly && (
            isEditing ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {isSaving ? <RadialSpinner size={12} /> : <HugeiconsIcon icon={FloppyDiskIcon} size={14} />}
                <span>Save</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={Edit01Icon} size={14} />
                <span>Edit</span>
              </button>
            )
          )}

          {!isReadOnly && onDelete && (
            <button
              onClick={() => {
                if (window.confirm('Delete this document permanently?')) {
                  onDelete(document.id);
                }
              }}
              className="p-1.5 rounded bg-zinc-900 border border-rose-950 text-rose-400 hover:bg-rose-950 cursor-pointer"
              title="Delete Document"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Metadata Sub-Bar */}
      <div className="px-4 py-2 bg-zinc-950/90 border-b border-zinc-800/60 text-[10.5px] text-zinc-400 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={UserIcon} size={12} className="text-zinc-500" />
            <span>Author: {document.author || 'Administrator'}</span>
          </span>

          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Clock01Icon} size={12} className="text-zinc-500" />
            <span>Updated: {new Date(document.updated_at).toLocaleDateString()}</span>
          </span>

          <span className="flex items-center gap-1">
            <span>Reading Time: {readingTime} min ({wordCount} words)</span>
          </span>
        </div>

        {tocItems.length > 0 && (
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <HugeiconsIcon icon={Menu01Icon} size={12} />
            <span>{isTocOpen ? 'Hide TOC' : 'Show TOC'} ({tocItems.length})</span>
          </button>
        )}

        {/* Mobile Inline TOC Toggle Dropdown */}
        {isTocOpen && tocItems.length > 0 && !isEditing && (
          <div className="w-full pt-2 border-t border-zinc-800/60 lg:hidden shrink-0">
            <div className="p-3 bg-zinc-900/90 rounded border border-zinc-800 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTocScroll(item.id);
                  }}
                  style={{ paddingLeft: `${(item.level - 1) * 10}px` }}
                  className="block w-full text-left py-1 text-[11px] text-zinc-300 hover:text-white truncate cursor-pointer"
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Split View: Markdown Content (Only Center Scrolls) & Table of Contents (Fixed Panel) */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Center Content Pane (Only Scrolling Area for Document Text) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 h-full min-w-0">
          {isEditing ? (
            <div className="space-y-3 h-full flex flex-col min-h-[500px]">
              <MarkdownToolbar
                onInsert={handleInsert}
                onCopy={handleCopyMarkdown}
                viewMode={editorViewMode}
                onViewModeChange={setEditorViewMode}
              />
              {editorViewMode === 'edit' && (
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Write markdown specification..."
                  className="w-full flex-1 min-h-[500px] p-4 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs outline-none focus:border-zinc-700 leading-relaxed resize-none custom-scrollbar"
                />
              )}
              {editorViewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
                  <textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Write markdown specification..."
                    className="w-full h-full min-h-[500px] p-4 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs outline-none focus:border-zinc-700 leading-relaxed resize-none custom-scrollbar"
                  />
                  <div className="h-full min-h-[500px] p-4 rounded bg-zinc-950 border border-zinc-800 overflow-y-auto custom-scrollbar font-mono text-xs text-zinc-200">
                    <MarkdownPreview content={editedContent || '*No content to preview*'} />
                  </div>
                </div>
              )}
              {editorViewMode === 'preview' && (
                <div className="w-full min-h-[500px] p-6 rounded bg-zinc-950 border border-zinc-800 overflow-y-auto custom-scrollbar font-mono text-xs text-zinc-200">
                  <MarkdownPreview content={editedContent || '*No content to preview*'} />
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none font-mono"
            >
              <MarkdownPreview
                content={document.content || '# Empty Document'}
                onExtractToc={(items) => setTocItems(items)}
              />
            </motion.div>
          )}

          {/* 4. Bottom Footer Navigation: Prev / Next */}
          <div className="pt-8 border-t border-zinc-800/80 flex items-center justify-between gap-4 text-xs font-mono">
            {onNavigatePrev ? (
              <button
                onClick={onNavigatePrev}
                className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                <span>Previous Specification</span>
              </button>
            ) : <div />}

            {onNavigateNext ? (
              <button
                onClick={onNavigateNext}
                className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Next Specification</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : <div />}
          </div>
        </div>

        {/* Table of Contents Fixed Sidebar Panel (Desktop) */}
        {isTocOpen && tocItems.length > 0 && !isEditing && (
          <div className="hidden lg:flex flex-col w-64 border-l border-zinc-800/80 bg-zinc-950/90 shrink-0 h-full overflow-hidden text-xs font-mono">
            <div className="p-4 border-b border-zinc-800/60 shrink-0 flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <HugeiconsIcon icon={Menu01Icon} size={13} />
                <span>On This Page</span>
              </h4>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-zinc-900 text-zinc-400">
                {tocItems.length}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTocScroll(item.id)}
                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                  className={`block w-full text-left py-1 text-[11px] truncate cursor-pointer transition-colors ${
                    activeHeadingId === item.id
                      ? 'text-cyan-400 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={item.text}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
