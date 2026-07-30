import React, { useState, useEffect } from 'react';
import type { DocumentItem, DocumentCategory, DocumentType } from '../../../lib/repositories/document.repository';
import { useProjects } from '../../../lib/supabase/queries/projects';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../../components/ui/sheet';
import { Select } from '../../../../packages/ui/src/components/select';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FileCodeIcon,
  PlusSignIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons';

interface DocumentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DocumentItem>) => Promise<any>;
  documentToEdit?: DocumentItem | null;
  defaultProjectId?: string;
}

const CATEGORY_OPTIONS: { label: string; value: DocumentCategory }[] = [
  { label: 'Getting Started', value: 'Getting Started' },
  { label: 'Development', value: 'Development' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Deployment', value: 'Deployment' },
  { label: 'Architecture', value: 'Architecture' },
  { label: 'Database', value: 'Database' },
  { label: 'API', value: 'API' },
  { label: 'Client', value: 'Client' },
  { label: 'Operations', value: 'Operations' },
  { label: 'General', value: 'General' },
];

const DOC_TYPE_OPTIONS: { label: string; value: DocumentType }[] = [
  { label: 'README', value: 'readme' },
  { label: 'API Documentation', value: 'api' },
  { label: 'Setup Guide', value: 'setup' },
  { label: 'Installation Guide', value: 'installation' },
  { label: 'Architecture Specs', value: 'architecture' },
  { label: 'Database Schema', value: 'database' },
  { label: 'User Manual', value: 'user_manual' },
  { label: 'Deployment Guide', value: 'deployment' },
  { label: 'Environment Variables', value: 'env' },
  { label: 'Release Notes', value: 'release_notes' },
  { label: 'Changelog', value: 'changelog' },
  { label: 'Custom Document', value: 'custom' },
];

export const DocumentFormDrawer: React.FC<DocumentFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  documentToEdit,
  defaultProjectId,
}) => {
  const [projectId, setProjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('General');
  const [docType, setDocType] = useState<DocumentType>('custom');
  const [author, setAuthor] = useState('Administrator');
  const [isClientVisible, setIsClientVisible] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projectsResult } = useProjects({ limit: 100 });
  const projects = (projectsResult as any)?.projects || [];

  const projectSelectOptions = projects.map((p: any) => ({
    value: p.id,
    label: p.name,
  }));

  useEffect(() => {
    if (documentToEdit) {
      setProjectId(documentToEdit.project_id);
      setTitle(documentToEdit.title || '');
      setCategory(documentToEdit.category || 'General');
      setDocType(documentToEdit.doc_type || 'custom');
      setAuthor(documentToEdit.author || 'Administrator');
      setIsClientVisible(Boolean(documentToEdit.is_client_visible));
      setContent(documentToEdit.content || '');
    } else {
      setProjectId(defaultProjectId || projects[0]?.id || '');
      setTitle('');
      setCategory('General');
      setDocType('custom');
      setAuthor('Administrator');
      setIsClientVisible(false);
      setContent('# New Specification Document\n\nWrite project specification here...');
    }
  }, [documentToEdit, defaultProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        project_id: projectId,
        title: title.trim(),
        category,
        doc_type: docType,
        author: author.trim(),
        is_client_visible: isClientVisible,
        content,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit document form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 font-mono p-0 flex flex-col select-none">
        <SheetHeader className="p-4 border-b border-zinc-800 bg-zinc-900/60">
          <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={FileCodeIcon} size={16} className="text-zinc-400" />
            <span>{documentToEdit ? 'Edit Document Metadata' : 'Create New Document'}</span>
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400">
            Create or edit project knowledge base entry specifications.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Project Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Target Project *</label>
              <Select
                value={projectId}
                onChange={setProjectId}
                options={projectSelectOptions}
                placeholder="Select project workspace..."
                className="w-full"
              />
            </div>

            {/* Document Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Document Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Architecture Overview & API Specs"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
              />
            </div>

            {/* Category & DocType */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Category</label>
                <Select
                  value={category}
                  onChange={(v) => setCategory(v as DocumentCategory)}
                  options={CATEGORY_OPTIONS}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Document Type</label>
                <Select
                  value={docType}
                  onChange={(v) => setDocType(v as DocumentType)}
                  options={DOC_TYPE_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Administrator"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
              />
            </div>

            {/* Client Visibility Toggle */}
            <div className="p-3 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <HugeiconsIcon icon={ViewIcon} size={14} className={isClientVisible ? 'text-cyan-400' : 'text-zinc-500'} />
                  <span>Client Visible (Share Link)</span>
                </span>
                <p className="text-[10px] text-zinc-400">
                  {isClientVisible
                    ? 'This document will be accessible in read-only mode via project Share Links.'
                    : 'This document remains strictly internal to administrators.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsClientVisible(!isClientVisible)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  isClientVisible ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    isClientVisible ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Initial Markdown Content */}
            {!documentToEdit && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Initial Content (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700 font-mono resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          <SheetFooter className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 rounded bg-white text-black hover:bg-zinc-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? <RadialSpinner size={14} /> : <HugeiconsIcon icon={PlusSignIcon} size={15} />}
              <span>{documentToEdit ? 'Save Changes' : 'Create Document'}</span>
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
