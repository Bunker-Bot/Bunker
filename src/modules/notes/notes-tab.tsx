import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useTogglePinNote,
  useToggleArchiveNote,
} from '../../lib/supabase/queries/notes';
import { useProjects } from '../projects/hooks/useProjects';
import { useClients } from '../../lib/supabase/queries/clients';
import type { NoteEntry, NoteTag } from './types/notes';
import { MarkdownToolbar } from '../projects/components/MarkdownToolbar';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { PageHeader } from '../../components/project/PageHeader';
import { ConfirmDeleteDialog } from '../../components/ui/confirm-delete-dialog';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Search01Icon,
  Folder01Icon,
  UserGroupIcon,
  Flag01Icon,
  ArchiveIcon,
  Delete02Icon,
  Copy01Icon,
  Download01Icon,
  Edit01Icon,
  EyeIcon,
  FileCodeIcon,
  LockKeyIcon,
  Tag01Icon,
} from '@hugeicons/core-free-icons';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';

const ALL_TAGS: NoteTag[] = [
  'Meeting',
  'Bug',
  'Payment',
  'Feature',
  'Urgent',
  'Backend',
  'Frontend',
  'Design',
  'Deployment',
  'Client Preference',
  'General',
];

const NOTE_DRAFT_KEY = 'bunker_private_note_draft';

export const NotesTab: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isArchivedView, setIsArchivedView] = useState(false);

  // Quick Composer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<NoteTag[]>(['General']);
  const [composerProjectId, setComposerProjectId] = useState<string>('none');
  const [composerClientId, setComposerClientId] = useState<string>('none');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<NoteEntry | null>(null);

  const { data: projectsResult } = useProjects();
  const { data: clientsResult } = useClients();

  const { data: notes = [], isLoading } = useNotes({
    projectId: selectedProjectId === 'all' ? undefined : selectedProjectId,
    clientId: selectedClientId === 'all' ? undefined : selectedClientId,
    search: searchQuery,
    tag: selectedTag === 'all' ? undefined : (selectedTag as NoteTag),
    isArchivedOnly: isArchivedView,
  });

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const togglePinMutation = useTogglePinNote();
  const toggleArchiveMutation = useToggleArchiveNote();

  // Restore draft on initial mount for new notes
  useEffect(() => {
    const saved = localStorage.getItem(NOTE_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.content) {
          setNoteTitle(parsed.title || '');
          setNoteContent(parsed.content || '');
          if (parsed.tags) setNoteTags(parsed.tags);
        }
      } catch { }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!editingNote && noteContent.trim()) {
      localStorage.setItem(
        NOTE_DRAFT_KEY,
        JSON.stringify({ title: noteTitle, content: noteContent, tags: noteTags })
      );
    }
  }, [noteTitle, noteContent, noteTags, editingNote]);

  const projectsOptions = useMemo(() => {
    const raw =
      (projectsResult as any)?.projects ||
      (projectsResult as any)?.data ||
      (Array.isArray(projectsResult) ? projectsResult : []);
    return raw.map((p: any) => ({ id: String(p.id), name: p.name || 'Untitled Project' }));
  }, [projectsResult]);

  const clientsOptions = useMemo(() => {
    const raw = (clientsResult as any)?.clients || (Array.isArray(clientsResult) ? clientsResult : []);
    return raw.map((c: any) => ({ id: String(c.id), name: c.name || 'Untitled Client' }));
  }, [clientsResult]);

  const pinnedNotes = useMemo(() => notes.filter((n) => n.isPinned), [notes]);
  const unpinnedNotes = useMemo(() => notes.filter((n) => !n.isPinned), [notes]);

  const handleComposerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    if (editingNote) {
      await updateMutation.mutateAsync({
        id: editingNote.id,
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent,
        tags: noteTags,
        projectId: composerProjectId === 'none' ? null : composerProjectId,
        clientId: composerClientId === 'none' ? null : composerClientId,
      });
      setEditingNote(null);
    } else {
      await createMutation.mutateAsync({
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent,
        tags: noteTags,
        projectId: composerProjectId === 'none' ? null : composerProjectId,
        clientId: composerClientId === 'none' ? null : composerClientId,
      });
      localStorage.removeItem(NOTE_DRAFT_KEY);
    }

    setNoteTitle('');
    setNoteContent('');
    setNoteTags(['General']);
    setIsComposerOpen(false);
  };

  const handleToggleTag = (tag: NoteTag) => {
    if (noteTags.includes(tag)) {
      if (noteTags.length === 1) return;
      setNoteTags(noteTags.filter((t) => t !== tag));
    } else {
      setNoteTags([...noteTags, tag]);
    }
  };

  const handleCopyMarkdown = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleExportMarkdown = (title: string, content: string) => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-[1700px] mx-auto space-y-6 font-sans text-zinc-100 select-none pb-12"
    >
      {/* Shared Platform PageHeader Component */}
      <PageHeader
        title={isArchivedView ? 'Archived Notes Workspace' : 'Private Notes Workspace'}
        description="Strictly internal knowledge base (Zero portal / viewer RLS access)"
        icon={LockKeyIcon}
        badge={
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono">
            Zero-Trust Admin Secured
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsArchivedView(!isArchivedView)}
              className={`h-8 px-3 rounded-sm border text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer ${isArchivedView
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
            >
              <HugeiconsIcon icon={ArchiveIcon} size={14} />
              <span>{isArchivedView ? 'Archived Notes' : 'Active Workspace'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setNoteTitle('');
                setNoteContent('');
                setNoteTags(['General']);
                setIsComposerOpen(true);
              }}
              className="h-8 px-3 rounded-sm bg-white text-black font-semibold text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer shadow hover:bg-zinc-200 transition-colors"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} />
              <span>Create Note</span>
            </button>
          </div>
        }
      />

      {/* Quick Note Composer Drawer / Modal */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-sm bg-[#0c0c0d] border border-zinc-800 space-y-4 shadow-xl font-mono text-xs overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h3 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                {editingNote ? 'Edit Note' : 'Compose Internal Note'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={isPreviewMode ? FileCodeIcon : EyeIcon} size={12} />
                <span>{isPreviewMode ? 'Editor' : 'Live Preview'}</span>
              </button>
            </div>

            <form onSubmit={handleComposerSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g. Client Pricing Agreement & Backend Requirements)"
                  className="flex-1 h-9 px-3 bg-zinc-900/90 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono placeholder:text-zinc-500 min-w-0"
                />

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Select value={composerProjectId} onValueChange={(val) => setComposerProjectId(val as string)}>
                    <SelectTrigger className="h-9 text-xs px-3 bg-zinc-900/90 border-zinc-800 rounded-sm font-mono text-zinc-300 hover:text-white flex items-center gap-2 shrink-0">
                      <HugeiconsIcon icon={Folder01Icon} size={14} className="text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {composerProjectId === 'none'
                          ? 'No Project'
                          : projectsOptions.find((p: any) => p.id === composerProjectId)?.name || 'Project'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                      <SelectItem value="none">
                        <span className="text-zinc-400">No Project</span>
                      </SelectItem>
                      {projectsOptions.map((p: { id: string; name: string }) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={composerClientId} onValueChange={(val) => setComposerClientId(val as string)}>
                    <SelectTrigger className="h-9 text-xs px-3 bg-zinc-900/90 border-zinc-800 rounded-sm font-mono text-zinc-300 hover:text-white flex items-center gap-2 shrink-0">
                      <HugeiconsIcon icon={UserGroupIcon} size={14} className="text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {composerClientId === 'none'
                          ? 'No Client'
                          : clientsOptions.find((c: any) => c.id === composerClientId)?.name || 'Client'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                      <SelectItem value="none">
                        <span className="text-zinc-400">No Client</span>
                      </SelectItem>
                      {clientsOptions.map((c: { id: string; name: string }) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tag Picker Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mr-1">Tags:</span>
                {ALL_TAGS.map((tag) => {
                  const active = noteTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${active
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-zinc-900/60 text-zinc-500 border border-zinc-800/60 hover:text-zinc-300'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Markdown Editor Workspace */}
              <div className="space-y-2">
                <MarkdownToolbar
                  onInsert={(prefix, suffix) => setNoteContent((prev) => `${prev}${prefix}text${suffix || ''}`)}
                  onCopy={() => handleCopyMarkdown(noteContent)}
                  viewMode={editorViewMode}
                  onViewModeChange={(mode) => setEditorViewMode(mode)}
                />

                {editorViewMode === 'edit' && (
                  <textarea
                    rows={12}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write private meeting notes, bug reports, checklists (- [ ]), code snippets (```), or payment discussions..."
                    className="w-full min-h-[260px] p-3.5 bg-zinc-900/90 border border-zinc-800 focus:border-zinc-600 rounded-b-lg text-xs text-white outline-none font-mono resize-y leading-relaxed"
                  />
                )}

                {editorViewMode === 'split' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[260px]">
                    <textarea
                      rows={12}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write markdown content here..."
                      className="w-full h-full min-h-[260px] p-3.5 bg-zinc-900/90 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono resize-y leading-relaxed"
                    />
                    <div className="min-h-[260px] max-h-[420px] p-4 rounded-sm bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 overflow-y-auto">
                      <MarkdownPreview content={noteContent || '*Nothing to preview yet...*'} />
                    </div>
                  </div>
                )}

                {editorViewMode === 'preview' && (
                  <div className="min-h-[260px] p-4 rounded-sm bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 overflow-y-auto">
                    <MarkdownPreview content={noteContent || '*Draft is empty...*'} />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="h-8 px-3 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!noteContent.trim() || createMutation.isPending || updateMutation.isPending}
                  className="h-8 px-4 rounded-sm bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {editingNote ? 'Save Note' : 'Post Note'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="p-3 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 font-mono text-xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 min-w-0 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-56 shrink-0">
            <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, tags, content..."
              className="w-full h-8 pl-8 pr-3 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-sm text-[11px] font-mono text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            {/* Project Filter */}
            <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val as string)}>
              <SelectTrigger className="h-8 text-[11px] px-2.5 bg-zinc-900 border-zinc-800 font-mono text-zinc-300 hover:text-white flex items-center justify-between sm:justify-start gap-1.5 rounded-sm w-full sm:w-auto shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon icon={Folder01Icon} size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">
                    {selectedProjectId === 'all'
                      ? 'All Projects'
                      : projectsOptions.find((p: any) => p.id === selectedProjectId)?.name || 'Project'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                <SelectItem value="all">All Projects</SelectItem>
                {projectsOptions.map((p: { id: string; name: string }) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Client Filter */}
            <Select value={selectedClientId} onValueChange={(val) => setSelectedClientId(val as string)}>
              <SelectTrigger className="h-8 text-[11px] px-2.5 bg-zinc-900 border-zinc-800 font-mono text-zinc-300 hover:text-white flex items-center justify-between sm:justify-start gap-1.5 rounded-sm w-full sm:w-auto shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon icon={UserGroupIcon} size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">
                    {selectedClientId === 'all'
                      ? 'All Clients'
                      : clientsOptions.find((c: any) => c.id === selectedClientId)?.name || 'Client'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                <SelectItem value="all">All Clients</SelectItem>
                {clientsOptions.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={(val) => setSelectedTag(val as string)}>
              <SelectTrigger className="h-8 text-[11px] px-2.5 bg-zinc-900 border-zinc-800 font-mono text-zinc-300 hover:text-white flex items-center justify-between sm:justify-start gap-1.5 rounded-sm w-full sm:w-auto shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon icon={Tag01Icon} size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">
                    {selectedTag === 'all' ? 'All Tags' : selectedTag}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                <SelectItem value="all">All Tags</SelectItem>
                {ALL_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="text-[11px] text-zinc-500 shrink-0 font-mono text-right pt-1.5 sm:pt-0 border-t sm:border-t-0 border-zinc-800/40">
          Showing <span className="text-zinc-200 font-bold">{notes.length}</span> private {notes.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Notes Feed Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-sm bg-[#0c0c0d] border border-zinc-800/40 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 text-center font-mono space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <HugeiconsIcon icon={LockKeyIcon} size={20} />
          </div>
          <h4 className="text-sm font-semibold text-zinc-300 font-sans">No private notes found</h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {isArchivedView
              ? 'No archived private notes.'
              : 'Click "New Private Note" above to write internal project ideas, meeting notes, or bug reports.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && !isArchivedView && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider px-1">
                <HugeiconsIcon icon={Flag01Icon} size={13} />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(n) => {
                      setEditingNote(n);
                      setNoteTitle(n.title);
                      setNoteContent(n.content);
                      setNoteTags(n.tags);
                      setComposerProjectId(n.projectId || 'none');
                      setComposerClientId(n.clientId || 'none');
                      setIsComposerOpen(true);
                    }}
                    onTogglePin={(id, pin) => togglePinMutation.mutate({ id, isPinned: pin })}
                    onToggleArchive={(id, arc) => toggleArchiveMutation.mutate({ id, isArchived: arc })}
                    onDelete={(n) => setNoteToDelete(n)}
                    onCopy={handleCopyMarkdown}
                    onExport={handleExportMarkdown}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular / Unpinned Section */}
          <div className="space-y-3">
            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider px-1 pt-2">
                <span>Recent Notes ({unpinnedNotes.length})</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(pinnedNotes.length > 0 && !isArchivedView ? unpinnedNotes : notes).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setNoteTitle(n.title);
                    setNoteContent(n.content);
                    setNoteTags(n.tags);
                    setComposerProjectId(n.projectId || 'none');
                    setComposerClientId(n.clientId || 'none');
                    setIsComposerOpen(true);
                  }}
                  onTogglePin={(id, pin) => togglePinMutation.mutate({ id, isPinned: pin })}
                  onToggleArchive={(id, arc) => toggleArchiveMutation.mutate({ id, isArchived: arc })}
                  onDelete={(n) => setNoteToDelete(n)}
                  onCopy={handleCopyMarkdown}
                  onExport={handleExportMarkdown}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Note Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteMutation.mutate(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        title="Delete Private Note"
        description={`Are you sure you want to delete "${noteToDelete?.title || ''}"? This action cannot be undone.`}
        confirmText="Delete Note"
      />
    </motion.div>
  );
};

interface NoteCardProps {
  note: NoteEntry;
  onEdit: (note: NoteEntry) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onToggleArchive: (id: string, isArchived: boolean) => void;
  onDelete: (note: NoteEntry) => void;
  onCopy: (content: string) => void;
  onExport: (title: string, content: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onCopy,
  onExport,
}) => {
  return (
    <div className="p-4 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 hover:border-zinc-700/80 transition-colors space-y-3 flex flex-col justify-between font-mono text-xs shadow-sm">
      <div className="space-y-2">
        {/* Card Top Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-bold text-white font-sans truncate">{note.title}</h4>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onTogglePin(note.id, !note.isPinned)}
              className={`p-1 rounded border transition-colors cursor-pointer ${note.isPinned
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <HugeiconsIcon icon={Flag01Icon} size={12} />
            </button>

            <button
              type="button"
              onClick={() => onToggleArchive(note.id, !note.isArchived)}
              className={`p-1 rounded border transition-colors cursor-pointer ${note.isArchived
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              title={note.isArchived ? 'Restore Note' : 'Archive Note'}
            >
              <HugeiconsIcon icon={ArchiveIcon} size={12} />
            </button>

            <button
              type="button"
              onClick={() => onEdit(note)}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="Edit Note"
            >
              <HugeiconsIcon icon={Edit01Icon} size={12} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(note)}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Note"
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          {note.tags.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-mono">
              {t}
            </span>
          ))}
          {note.projectName && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-mono">
              Proj: {note.projectName}
            </span>
          )}
          {note.clientName && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-mono">
              Client: {note.clientName}
            </span>
          )}
        </div>

        {/* Markdown Preview Content */}
        <div className="text-xs text-zinc-300 font-sans leading-relaxed pt-1 line-clamp-4">
          <MarkdownPreview content={note.content} />
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[10px] text-zinc-500">
        <span className="truncate">Internal Only</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopy(note.content)}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy Markdown"
          >
            <HugeiconsIcon icon={Copy01Icon} size={11} />
            <span>Copy</span>
          </button>
          <button
            type="button"
            onClick={() => onExport(note.title, note.content)}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Export .md File"
          >
            <HugeiconsIcon icon={Download01Icon} size={11} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesTab;
