import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Add01Icon,
  Edit01Icon,
  Tag01Icon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons';
import { MarkdownToolbar } from '../projects/components/MarkdownToolbar';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { useCheckVersionExists } from '../../lib/supabase/queries/changelog';
import type { ChangelogEntry, CreateChangelogInput } from './types/changelog';

const semverRegex = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const changelogSchema = z.object({
  version: z
    .string()
    .min(1, 'Version number is required')
    .regex(semverRegex, 'Must be valid SemVer e.g. v1.0.0, 1.2.3, 2.0.0-beta'),
  title: z
    .string()
    .min(2, 'Release title must be at least 2 characters')
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters'),
  releasedAt: z.string().min(1, 'Release date is required'),
});

type ChangelogFormData = z.infer<typeof changelogSchema>;

interface ChangelogFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateChangelogInput & { id?: string }) => Promise<void>;
  projectId: string;
  initialData?: ChangelogEntry | null;
  isSubmitting?: boolean;
}

const DRAFT_KEY_PREFIX = 'bunker_changelog_draft_';

export const ChangelogFormDrawer: React.FC<ChangelogFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  initialData,
  isSubmitting = false,
}) => {
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const draftKey = `${DRAFT_KEY_PREFIX}${projectId}`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangelogFormData>({
    resolver: zodResolver(changelogSchema),
    defaultValues: {
      version: initialData?.version || 'v1.0.0',
      title: initialData?.title || '',
      description: initialData?.description || '',
      releasedAt: initialData?.releasedAt ? initialData.releasedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const watchedVersion = watch('version');
  const watchedDescription = watch('description');
  const watchedReleasedAt = watch('releasedAt');
  const selectedDate = watchedReleasedAt ? new Date(watchedReleasedAt) : new Date();

  // Check version uniqueness
  const { data: isDuplicateVersion } = useCheckVersionExists(
    projectId,
    watchedVersion || '',
    initialData?.id
  );

  // Restore local draft on open for new entries
  useEffect(() => {
    if (isOpen) {
      setEditorViewMode('edit');
      if (initialData) {
        reset({
          version: initialData.version,
          title: initialData.title,
          description: initialData.description,
          releasedAt: initialData.releasedAt.split('T')[0],
        });
      } else {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            reset(parsed);
          } catch {}
        }
      }
    }
  }, [isOpen, initialData, draftKey, reset]);

  // Auto-save draft locally while editing new entries
  useEffect(() => {
    if (!initialData && isOpen) {
      const draftData = {
        version: watchedVersion,
        title: watch('title'),
        description: watchedDescription,
        releasedAt: watchedReleasedAt,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }
  }, [watchedVersion, watchedDescription, watchedReleasedAt, watch, initialData, isOpen, draftKey]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ChangelogFormData) => {
    let formattedVersion = data.version.trim();
    if (!formattedVersion.startsWith('v')) {
      formattedVersion = `v${formattedVersion}`;
    }

    await onSubmit({
      id: initialData?.id,
      projectId,
      version: formattedVersion,
      title: data.title,
      description: data.description,
      releasedAt: new Date(data.releasedAt).toISOString(),
    });

    if (!initialData) {
      localStorage.removeItem(draftKey);
    }
    onClose();
  };

  const handleInsertMarkdown = (prefix: string, suffix = '') => {
    const current = watchedDescription || '';
    setValue('description', `${current}${prefix}text${suffix}`, { shouldValidate: true });
  };

  const handleCopyMarkdown = () => {
    if (watchedDescription) {
      navigator.clipboard.writeText(watchedDescription);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-end select-none font-sans">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-2xl h-full bg-[#0c0c0e]/98 border-l border-zinc-800/90 p-6 font-mono text-xs space-y-5 shadow-2xl overflow-y-auto flex flex-col justify-between"
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HugeiconsIcon icon={initialData ? Edit01Icon : Add01Icon} size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans tracking-tight">
                    {initialData ? 'Edit Release Notes' : 'Publish Version Release'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    GitHub-style semantic versioning & technical changelog log
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            <form id="changelog-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Row 1: Version & Release Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HugeiconsIcon icon={Tag01Icon} size={12} className="text-zinc-500" />
                    <span>Version (SemVer) (*)</span>
                  </label>
                  <input
                    type="text"
                    {...register('version')}
                    placeholder="e.g. v1.0.0, 1.2.3, 2.0.0-rc1"
                    className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
                  />
                  {errors.version && (
                    <p className="text-[10px] text-rose-400 font-mono">{errors.version.message}</p>
                  )}
                  {isDuplicateVersion && (
                    <p className="text-[10px] text-amber-400 font-mono">Warning: Version {watchedVersion} already exists for this project.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-zinc-500" />
                    <span>Release Date (*)</span>
                  </label>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono flex items-center justify-between transition-colors cursor-pointer hover:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-emerald-400" />
                        <span>{watchedReleasedAt && !isNaN(new Date(watchedReleasedAt).getTime()) ? format(new Date(watchedReleasedAt), 'MMM d, yyyy') : 'Select Date'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{watchedReleasedAt}</span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-zinc-950 border-zinc-800" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            const formatted = date.toISOString().split('T')[0];
                            setValue('releasedAt', formatted, { shouldValidate: true });
                            setIsDatePickerOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.releasedAt && (
                    <p className="text-[10px] text-rose-400 font-mono">{errors.releasedAt.message}</p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Release Title (*)
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. Initial Production Launch & API Gateways"
                  className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
                />
                {errors.title && (
                  <p className="text-[10px] text-rose-400 font-mono">{errors.title.message}</p>
                )}
              </div>

              {/* Description (Markdown Workspace) */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Release Notes (Markdown Supported)
                </label>

                <div className="space-y-2">
                  <MarkdownToolbar
                    onInsert={handleInsertMarkdown}
                    onCopy={handleCopyMarkdown}
                    viewMode={editorViewMode}
                    onViewModeChange={setEditorViewMode}
                  />

                  {editorViewMode === 'edit' && (
                    <textarea
                      rows={10}
                      {...register('description')}
                      placeholder="Write release notes, feature highlights, bug fixes, or breaking API changes using Markdown..."
                      className="w-full p-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono leading-relaxed transition-colors min-h-[220px] resize-y"
                    />
                  )}

                  {editorViewMode === 'split' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <textarea
                        rows={10}
                        {...register('description')}
                        placeholder="Write release notes..."
                        className="w-full p-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono leading-relaxed transition-colors min-h-[220px] resize-y"
                      />
                      <div className="min-h-[220px] max-h-[400px] p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 overflow-y-auto custom-scrollbar">
                        <MarkdownPreview content={watchedDescription || '*No release notes preview...*'} />
                      </div>
                    </div>
                  )}

                  {editorViewMode === 'preview' && (
                    <div className="min-h-[240px] max-h-[450px] p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 overflow-y-auto custom-scrollbar">
                      <MarkdownPreview content={watchedDescription || '*No release notes preview...*'} />
                    </div>
                  )}
                </div>

                {errors.description && (
                  <p className="text-[10px] text-rose-400 font-mono">{errors.description.message}</p>
                )}
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="changelog-form"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-lg bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Publishing...' : initialData ? 'Save Changes' : 'Publish Release'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
