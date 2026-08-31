import React, { useState, useEffect, useRef } from 'react';
import type { ProjectSection, SaveStatus } from '../../../types/project-section';
import { useUpdateProjectSection } from '../hooks/useUpdateProjectSection';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { AutosaveIndicator } from './AutosaveIndicator';
import { TableOfContents, type TocItem } from './TableOfContents';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';

interface MarkdownWorkspaceProps {
  section: ProjectSection;
  projectId: string;
}

export const MarkdownWorkspace: React.FC<MarkdownWorkspaceProps> = ({
  section,
  projectId,
}) => {
  const [content, setContent] = useState(section.content || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const updateMutation = useUpdateProjectSection();

  useEffect(() => {
    setContent(section.content || '');
    setSaveStatus('saved');
  }, [section.id, section.content]);

  useEffect(() => {
    if (content === (section.content || '')) return;

    setSaveStatus('unsaved');

    const timer = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await updateMutation.mutateAsync({
          sectionId: section.id,
          projectId,
          input: { content },
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [content, section.id, section.content, projectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSaveStatus('saving');
        updateMutation
          .mutateAsync({
            sectionId: section.id,
            projectId,
            input: { content },
          })
          .then(() => setSaveStatus('saved'))
          .catch(() => setSaveStatus('error'));
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setViewMode((prev) => (prev === 'edit' ? 'preview' : prev === 'preview' ? 'split' : 'edit'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, section.id, projectId, isFullscreen]);

  const handleInsert = (prefix: string, suffix: string = '') => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleTocSelect = (id: string) => {
    setActiveHeadingId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split('\n').length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleExtractToc = React.useCallback((items: TocItem[]) => {
    setTocItems(items);
  }, []);

  return (
    <div
      className={`flex flex-col rounded-sm bg-[rgba(14,14,16,0.92)] border border-zinc-800/80 shadow-2xl backdrop-blur-2xl overflow-hidden select-none transition-all ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none border-none h-screen' : 'h-[720px]'
        }`}
    >
      <MarkdownToolbar
        onInsert={handleInsert}
        onCopy={handleCopy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {showSearch && (
        <div className="flex items-center gap-2 p-2 bg-zinc-900 border-b border-zinc-800 text-xs">
          <HugeiconsIcon icon={Search01Icon} size={14} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text in documentation (Ctrl + F)..."
            className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-xs font-mono"
          />
          <button
            type="button"
            onClick={() => setShowSearch(false)}
            className="text-zinc-500 hover:text-white px-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-w-0 min-h-0">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${viewMode === 'split' ? 'border-b lg:border-b-0 lg:border-r border-zinc-800/80' : ''}`}>
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start documenting architecture, setup steps, or API contracts in GitHub-Class Markdown..."
              className="w-full h-full p-4 sm:p-5 bg-transparent text-zinc-100 font-mono text-xs outline-none resize-none leading-relaxed custom-scrollbar select-text min-w-0"
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex gap-4 p-2 bg-zinc-950/40 overflow-hidden min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0 max-w-full">
              <MarkdownPreview content={content} onExtractToc={handleExtractToc} />
            </div>

            {tocItems.length > 0 && (
              <TableOfContents
                items={tocItems}
                activeId={activeHeadingId}
                onSelect={handleTocSelect}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto custom-scrollbar whitespace-nowrap min-w-0 py-0.5">
          <span className="whitespace-nowrap">{charCount.toLocaleString()} Chars</span>
          <span className="text-zinc-600">•</span>
          <span className="whitespace-nowrap">{wordCount.toLocaleString()} Words</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="whitespace-nowrap hidden sm:inline">{lineCount.toLocaleString()} Lines</span>
          <span className="text-zinc-600 hidden md:inline">•</span>
          <span className="whitespace-nowrap hidden md:inline">{readingTimeMinutes} min read</span>
        </div>

        <div className="shrink-0">
          <AutosaveIndicator status={saveStatus} />
        </div>
      </div>
    </div>
  );
};

export default MarkdownWorkspace;
