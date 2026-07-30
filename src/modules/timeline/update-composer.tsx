import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTimelineUpdate, useUpdateTimelineUpdate } from '../../lib/supabase/queries/timeline';
import { MarkdownToolbar } from '../projects/components/MarkdownToolbar';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { DatePicker } from '../../../packages/ui/src/components/date-picker';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Edit01Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';

const DRAFT_STORAGE_KEY = 'bunker_timeline_update_draft';
const MAX_DESCRIPTION_LENGTH = 20000;
const MAX_TITLE_LENGTH = 150;

export const timelineComposerSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`)
    .transform((val) => val.trim()),
  entry_date: z.string().min(1, 'Entry date is required.'),
  description: z
    .string()
    .min(1, 'Markdown update description is required.')
    .max(MAX_DESCRIPTION_LENGTH, `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`),
});

export type TimelineComposerData = z.infer<typeof timelineComposerSchema>;

export interface UpdateComposerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  updateToEdit?: {
    id: string;
    title: string;
    description?: string;
    entry_date: string;
    attachments?: any[];
  } | null;
}

export const UpdateComposer: React.FC<UpdateComposerProps> = ({
  isOpen,
  onClose,
  projectId,
  updateToEdit = null,
}) => {
  const isEditing = Boolean(updateToEdit);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [debouncedDescription, setDebouncedDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const createMutation = useCreateTimelineUpdate();
  const updateMutation = useUpdateTimelineUpdate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<TimelineComposerData>({
    resolver: zodResolver(timelineComposerSchema),
    defaultValues: {
      title: '',
      entry_date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const titleValue = watch('title');
  const dateValue = watch('entry_date');
  const descriptionValue = watch('description') || '';

  // 150ms Debounced live preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDescription(descriptionValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [descriptionValue]);

  // Load draft or populate updateToEdit on open
  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);

    if (updateToEdit) {
      reset({
        title: updateToEdit.title || '',
        entry_date: updateToEdit.entry_date || new Date().toISOString().split('T')[0],
        description: updateToEdit.description || '',
      });
      setHasRestoredDraft(false);
    } else {
      // Restore auto-saved draft
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          reset({
            title: parsed.title || '',
            entry_date: parsed.entry_date || new Date().toISOString().split('T')[0],
            description: parsed.description || '',
          });
          setHasRestoredDraft(true);
        } else {
          reset({
            title: '',
            entry_date: new Date().toISOString().split('T')[0],
            description: '',
          });
          setHasRestoredDraft(false);
        }
      } catch (err) {
        console.warn('Failed to load draft from localStorage:', err);
      }
    }
  }, [isOpen, updateToEdit, reset]);

  // Auto-save draft when writing new update
  useEffect(() => {
    if (isOpen && !updateToEdit) {
      const draft = {
        title: titleValue,
        entry_date: dateValue,
        description: descriptionValue,
      };
      if (titleValue || descriptionValue) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      }
    }
  }, [isOpen, updateToEdit, titleValue, dateValue, descriptionValue]);

  // Handle Markdown Insertion from Toolbar
  const handleInsertMarkdown = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const selectedText = currentText.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    setValue('description', newText, { shouldDirty: true, shouldValidate: true });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(descriptionValue);
  };

  const handleCloseAttempt = () => {
    if (isDirty && window.confirm('You have unsaved changes. Are you sure you want to exit?')) {
      onClose();
    } else if (!isDirty) {
      onClose();
    }
  };

  const onSubmit = async (data: TimelineComposerData) => {
    setFormError(null);
    try {
      if (isEditing && updateToEdit?.id) {
        await updateMutation.mutateAsync({
          id: updateToEdit.id,
          projectId,
          payload: {
            title: data.title,
            entry_date: data.entry_date,
            description: data.description,
          },
        });
      } else {
        await createMutation.mutateAsync({
          project_id: projectId,
          title: data.title,
          entry_date: data.entry_date,
          description: data.description,
        });

        // Clear local draft after publishing
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit timeline update.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const descriptionCharCount = descriptionValue.length;
  const isNearCharLimit = descriptionCharCount > MAX_DESCRIPTION_LENGTH * 0.9;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm font-mono select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl rounded-sm bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        >
          {/* 1. Header Banner */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/90 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-sm bg-zinc-800 border border-zinc-700 text-white shrink-0">
                <HugeiconsIcon icon={isEditing ? Edit01Icon : Calendar01Icon} size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight truncate">
                    {isEditing ? 'Edit Project Update' : 'New Timeline Update'}
                  </h2>
                  {hasRestoredDraft && !isEditing && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] uppercase font-bold">
                      Restored Unsaved Draft
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Compose rich Markdown progress updates and technical release logs.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseAttempt}
              className="p-1.5 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* 2. Main Form Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Top Inputs Bar */}
            <div className="p-4 bg-zinc-950/50 border-b border-zinc-800/80 space-y-3 shrink-0 text-xs">
              {formError && (
                <div className="p-3 rounded-sm bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Title Input */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                    Update Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    maxLength={MAX_TITLE_LENGTH}
                    placeholder="e.g. Completed API architecture refactoring & database migrations"
                    className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
                  />
                  {errors.title && (
                    <p className="text-[10px] text-rose-400">{errors.title.message}</p>
                  )}
                </div>

                {/* Entry Date Input — Portal DatePicker */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                    Entry Date <span className="text-rose-400">*</span>
                  </label>
                  <Controller
                    name="entry_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Entry Date"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.entry_date && (
                    <p className="text-[10px] text-rose-400">{errors.entry_date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Markdown Toolbar */}
            <div className="shrink-0 px-2 bg-zinc-950/80">
              <MarkdownToolbar
                onInsert={handleInsertMarkdown}
                onCopy={handleCopyMarkdown}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Editor vs Live Preview Content Split Container */}
            <div className="flex-1 flex min-h-0 bg-zinc-950 overflow-hidden">
              {/* Split/Edit Mode: Textarea Editor */}
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className={`h-full flex flex-col p-4 overflow-hidden border-r border-zinc-800/80 ${
                  viewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}>
                  <textarea
                    {...register('description')}
                    ref={(e) => {
                      register('description').ref(e);
                      textareaRef.current = e;
                    }}
                    placeholder="Write detailed progress updates using Markdown... (# Heading, **bold**, - list, ```code```)"
                    className="w-full h-full bg-transparent text-zinc-200 placeholder-zinc-600 text-xs outline-none resize-none font-sans leading-relaxed custom-scrollbar"
                  />
                </div>
              )}

              {/* Split/Preview Mode: Rendered Live Markdown Preview */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`h-full overflow-y-auto p-4 bg-zinc-900/30 custom-scrollbar ${
                  viewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}>
                  {debouncedDescription ? (
                    <MarkdownPreview content={debouncedDescription} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                      Live Markdown preview will render here as you type...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Footer Bar */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[11px] ${isNearCharLimit ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                  {descriptionCharCount.toLocaleString()} / {MAX_DESCRIPTION_LENGTH.toLocaleString()}
                </span>
                {errors.description && (
                  <span className="text-[10px] text-rose-400 font-bold">{errors.description.message}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseAttempt}
                  disabled={isPending}
                  className="px-4 py-2 rounded-sm bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isPending ? <RadialSpinner size={14} /> : <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />}
                  <span>{isPending ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Update'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpdateComposer;
