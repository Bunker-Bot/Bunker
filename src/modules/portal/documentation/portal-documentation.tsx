import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Book01Icon,
  Search01Icon,
  Copy01Icon,
  Tick02Icon,
  Clock01Icon,
  Folder01Icon,
  Menu01Icon,
  ArrowRight01Icon,
  FileCodeIcon,
  Share01Icon,
  PrinterIcon,
} from '@hugeicons/core-free-icons';

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';
import { AppLogo } from '../../../components/ui/AppLogo';
import { MarkdownPreview } from '../../projects/components/MarkdownPreview';

export interface PublicDocItem {
  id: string;
  title: string;
  category?: string;
  content?: string;
  updated_at?: string;
  created_at?: string;
  version?: string;
  tags?: string[];
}

interface PortalDocumentationProps {
  docs: PublicDocItem[];
  projectName?: string;
}

function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractHeadings(markdownText: string): { id: string; text: string; level: number }[] {
  if (!markdownText) return [];
  const lines = markdownText.split('\n');
  const headings: { id: string; text: string; level: number }[] = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].replace(/[#*`_~]/g, '').trim();
      const id = rawText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ id, text: rawText, level });
    }
  });

  return headings;
}

export const PortalDocumentationView: React.FC<PortalDocumentationProps> = ({
  docs = [],
  projectName = 'Project Workspace',
}) => {
  const docList = useMemo(() => {
    return (docs || []).map((d, idx) => ({
      id: d.id || `doc-${idx}`,
      title: d.title || 'Untitled Document',
      category: d.category || 'Architecture & Guides',
      content: d.content || 'No content provided for this document.',
      updated_at: d.updated_at || d.created_at || new Date().toISOString(),
      version: d.version || 'v1.0',
    }));
  }, [docs]);

  const [selectedDocId, setSelectedDocId] = useState<string>(docList[0]?.id || '');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Selected document
  const selectedDoc = useMemo(() => {
    return docList.find((d) => d.id === selectedDocId) || docList[0];
  }, [docList, selectedDocId]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    if (!debouncedSearch.trim()) return docList;
    const query = debouncedSearch.toLowerCase();
    return docList.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query) ||
        d.content.toLowerCase().includes(query)
    );
  }, [docList, debouncedSearch]);

  // Grouped by Category
  const categories = useMemo(() => {
    const map: Record<string, PublicDocItem[]> = {};
    filteredDocs.forEach((d) => {
      const cat = d.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(d);
    });
    return map;
  }, [filteredDocs]);

  // TOC Headings
  const headings = useMemo(() => {
    return selectedDoc ? extractHeadings(selectedDoc.content || '') : [];
  }, [selectedDoc]);

  // Related documents
  const relatedDocs = useMemo(() => {
    if (!selectedDoc) return [];
    return docList.filter((d) => d.id !== selectedDoc.id).slice(0, 3);
  }, [docList, selectedDoc]);

  // Track Reading Progress on Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight <= 0) {
        setReadingProgress(100);
        return;
      }
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const progress = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const readingTime = useMemo(() => {
    return selectedDoc ? calculateReadingTime(selectedDoc.content || '') : 1;
  }, [selectedDoc]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyContent = () => {
    if (selectedDoc?.content) {
      navigator.clipboard.writeText(selectedDoc.content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setIsMobileSheetOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (docList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-12 rounded-sm bg-zinc-950/90 border border-zinc-800 text-center space-y-4 font-mono select-none my-8 max-w-2xl mx-auto shadow-2xl"
      >
        <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 mx-auto">
          <HugeiconsIcon icon={Book01Icon} size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-white">Documentation Not Published Yet</h2>
          <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
            No architecture guides or technical specifications have been published for this project yet. Please check back later!
          </p>
        </div>
        <Badge variant="outline" className="rounded-sm bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px]">
          Read-Only Client Portal
        </Badge>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs select-none min-h-screen">
      
      {/* STICKY TOP READING PROGRESS BAR */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-zinc-950 z-30 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* STICKY DOCUMENTATION HEADER */}
      <header className="p-3 sm:p-4 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Mobile Drawer Trigger + Breadcrumb */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="xl:hidden shrink-0">
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger>
                  <button
                    type="button"
                    className="p-1.5 sm:p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Open Documentation Explorer"
                  >
                    <HugeiconsIcon icon={Menu01Icon} size={16} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] max-w-[90vw] p-0 bg-[#09090b] border-r border-zinc-800 text-white font-mono">
                  <SheetHeader className="p-4 border-b border-zinc-800 text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <AppLogo size={22} showText={false} />
                      <SheetTitle className="text-sm font-extrabold text-white">Documentation Explorer</SheetTitle>
                    </div>
                    <div className="relative pt-1">
                      <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search docs..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white text-xs outline-none focus:border-purple-500 font-sans"
                      />
                    </div>
                  </SheetHeader>

                  <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
                    {Object.entries(categories).map(([cat, items]) => (
                      <div key={cat} className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-sans font-bold uppercase tracking-wider block px-2">
                          {cat}
                        </span>
                        {items.map((doc) => {
                          const isSelected = selectedDoc?.id === doc.id;
                          return (
                            <button
                              key={doc.id}
                              onClick={() => handleSelectDoc(doc.id)}
                              className={`w-full text-left px-3 py-2 rounded-sm text-xs transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-950/80 text-white border border-purple-800 font-bold'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                              }`}
                            >
                              <span className="truncate">{doc.title}</span>
                              <HugeiconsIcon icon={Book01Icon} size={13} className={isSelected ? 'text-purple-400' : 'text-zinc-600'} />
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 text-xs font-sans">
              <span className="text-zinc-400 truncate max-w-[110px] sm:max-w-[180px]">{projectName}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-purple-400 font-mono font-bold shrink-0">Docs</span>
              {selectedDoc?.title && (
                <>
                  <span className="text-zinc-600 hidden md:inline">/</span>
                  <span className="text-white font-bold truncate hidden md:inline max-w-[150px]">{selectedDoc.title}</span>
                </>
              )}
            </div>
          </div>

          {/* Reading Time Badge on Mobile Top-Right */}
          <div className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-sans shrink-0">
            <HugeiconsIcon icon={Clock01Icon} size={11} className="text-purple-400" />
            <span>{readingTime}m</span>
          </div>
        </div>

        {/* Right: Actions (Copy Link, Copy Content, Print) */}
        <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-850">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-sans">
            <HugeiconsIcon icon={Clock01Icon} size={12} className="text-purple-400" />
            <span>{readingTime} min read</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="h-8 px-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy Share Link"
          >
            <HugeiconsIcon icon={copiedLink ? Tick02Icon : Share01Icon} size={13} className={copiedLink ? 'text-emerald-400' : ''} />
            <span className="inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handleCopyContent}
            className="h-8 px-2.5 rounded-sm bg-purple-950/80 border border-purple-800 hover:bg-purple-900 text-purple-200 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy Raw Markdown Content"
          >
            <HugeiconsIcon icon={copiedContent ? Tick02Icon : Copy01Icon} size={13} className={copiedContent ? 'text-emerald-400' : ''} />
            <span>{copiedContent ? 'Copied' : 'Copy Spec'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="h-8 p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center justify-center"
            title="Print / Save PDF"
          >
            <HugeiconsIcon icon={PrinterIcon} size={14} />
          </button>
        </div>
      </header>

      {/* MAIN DOCUMENTATION GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* DESKTOP SIDEBAR EXPLORER (Fixed 3 Cols Panel) */}
        <aside className="hidden xl:block xl:col-span-3 space-y-4 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar pr-1">
          <div className="p-4 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
              <span className="font-extrabold text-white text-xs">Knowledge Base ({docList.length})</span>
              <Badge variant="outline" className="rounded-sm bg-zinc-900 border-zinc-800 text-zinc-400 text-[9px]">
                Read-Only
              </Badge>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* Categories & Items Tree */}
            <div className="space-y-4 pt-1">
              {Object.keys(categories).length === 0 ? (
                <p className="text-zinc-500 text-xs py-2 text-center font-sans">No matching guides found.</p>
              ) : (
                Object.entries(categories).map(([catName, catItems]) => (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase tracking-wider font-sans font-bold px-2 py-0.5">
                      <HugeiconsIcon icon={Folder01Icon} size={11} className="text-purple-400" />
                      <span>{catName}</span>
                    </div>

                    <div className="space-y-1">
                      {catItems.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => handleSelectDoc(doc.id)}
                            className={`w-full text-left px-3 py-2 rounded-sm text-xs transition-all cursor-pointer flex items-center justify-between border ${
                              isSelected
                                ? 'bg-purple-950/80 text-white border-purple-800 shadow-md font-bold'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent'
                            }`}
                          >
                            <span className="truncate">{doc.title}</span>
                            <HugeiconsIcon icon={Book01Icon} size={13} className={isSelected ? 'text-purple-400' : 'text-zinc-600'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* MAIN DOCUMENT VIEWING CONTAINER (Centered 900px Max-Width) */}
        <main ref={contentRef} className="xl:col-span-6 space-y-6 min-w-0">
          {selectedDoc ? (
            <motion.div
              key={selectedDoc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-6 max-w-[900px] mx-auto"
            >
              {/* Document Header Metadata Row */}
              <div className="border-b border-zinc-850 pb-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-sm bg-purple-950/80 text-purple-300 border-purple-800 text-[10px] uppercase font-bold">
                    {selectedDoc.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-sm bg-zinc-900 text-cyan-300 border-zinc-800 text-[10px] font-mono">
                    {selectedDoc.version}
                  </Badge>
                  <span className="text-[11px] text-zinc-500 font-sans ml-auto">
                    Updated {new Date(selectedDoc.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {selectedDoc.title}
                </h1>
              </div>

              {/* Rendered Markdown Reader Body */}
              <article className="font-sans text-sm text-zinc-200 leading-relaxed max-w-none">
                <MarkdownPreview content={selectedDoc.content || ''} />
              </article>

              {/* Related Documents Navigation Footer */}
              {relatedDocs.length > 0 && (
                <div className="pt-8 border-t border-zinc-850 space-y-3">
                  <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-purple-400" />
                    Continue Reading Related Architecture Specs
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedDocs.map((rDoc) => (
                      <div
                        key={rDoc.id}
                        onClick={() => handleSelectDoc(rDoc.id)}
                        className="p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 hover:border-purple-500/50 hover:bg-zinc-900 transition-all cursor-pointer space-y-1.5 group shadow-sm"
                      >
                        <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold block">
                          {rDoc.category}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate group-hover:text-purple-300 transition-colors">
                          {rDoc.title}
                        </h4>
                        <span className="text-[10px] text-purple-400 font-mono inline-flex items-center gap-1 pt-1">
                          <span>Read</span>
                          <HugeiconsIcon icon={ArrowRight01Icon} size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-8 rounded-sm bg-zinc-950 border border-zinc-800 text-center text-zinc-500">
              Select a document to read.
            </div>
          )}
        </main>

        {/* DESKTOP TABLE OF CONTENTS (Fixed Right 3 Cols Panel) */}
        <aside className="hidden xl:block xl:col-span-3 space-y-4 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar pl-1">
          <div className="p-4 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 font-extrabold text-white text-xs border-b border-zinc-850 pb-2.5">
              <HugeiconsIcon icon={FileCodeIcon} size={14} className="text-cyan-400" />
              <span>On This Page</span>
            </div>

            {headings.length === 0 ? (
              <p className="text-[11px] text-zinc-500 font-sans">No outline headings found in this guide.</p>
            ) : (
              <nav className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar font-sans text-xs">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveHeadingId(h.id);
                      const targetEl = document.getElementById(h.id);
                      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block py-1 px-2 rounded-sm transition-colors text-xs truncate ${
                      h.level === 2 ? 'pl-4' : h.level === 3 ? 'pl-6' : ''
                    } ${
                      activeHeadingId === h.id
                        ? 'text-cyan-400 font-bold bg-zinc-900 border-l-2 border-cyan-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default PortalDocumentationView;
