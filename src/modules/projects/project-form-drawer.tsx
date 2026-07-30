import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { projectFormSchema, sanitizeProjectData, type ProjectFormData } from '../../lib/validators/project-schema';
import { useCreateProject, useUpdateProject, useClientsForSelect } from '../../lib/supabase/queries/projects';
import { useSyncGithubRepository } from '../../lib/supabase/queries/github';
import { Select } from '../../../packages/ui/src/components/select';
import { DatePicker } from '../../../packages/ui/src/components/date-picker';
import { TechnologyPicker } from './technology-picker';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Folder01Icon,
  CheckmarkCircle02Icon,
  PaintBucketIcon,
  AlertCircleIcon,
  Delete02Icon,
  Tag01Icon,
  GithubIcon
} from '@hugeicons/core-free-icons';

interface ProjectFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: any | null;
}

const PRESET_COLORS = [
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Zinc', hex: '#71717A' },
];

const DRAFT_STORAGE_KEY = 'bunker_project_form_draft';

export const ProjectFormDrawer: React.FC<ProjectFormDrawerProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const isEditing = Boolean(projectToEdit);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const syncGithubMutation = useSyncGithubRepository();

  const { data: clientOptions = [], isLoading: isLoadingClients } = useClientsForSelect(isOpen);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      client_id: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      deadline: '',
      completion_percent: 0,
      color: '#E11D48',
      thumbnail_url: '',
      github_repo_url: '',
    },
  });

  const watchValues = watch();
  const watchName = watch('name');
  const watchColor = watch('color');
  const watchCompletion = watch('completion_percent');

  // Auto-generate slug from name unless manually edited
  useEffect(() => {
    if (!isEditing && !slugManuallyEdited && watchName) {
      const generated = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [watchName, isEditing, slugManuallyEdited, setValue]);

  // Draft auto-save to localStorage when creating a new project
  useEffect(() => {
    if (!isEditing && isOpen && isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...watchValues, technologies }));
        setHasDraft(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchValues, technologies, isEditing, isOpen, isDirty]);

  // Populate form values when entering edit mode or restore draft on open
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setSlugManuallyEdited(true);
        setHasDraft(false);
        setTechnologies(projectToEdit.technologies || []);
        reset({
          name: projectToEdit.name || '',
          slug: projectToEdit.slug || '',
          description: projectToEdit.description || '',
          client_id: projectToEdit.clientId || projectToEdit.client_id || '',
          status: projectToEdit.status || 'planning',
          priority: projectToEdit.priority || 'medium',
          start_date: projectToEdit.startDate || projectToEdit.start_date || '',
          deadline: projectToEdit.deadline || '',
          completion_percent: projectToEdit.completionPercent ?? projectToEdit.completion_percent ?? 0,
          color: projectToEdit.color || '#E11D48',
          thumbnail_url: projectToEdit.thumbnailUrl || projectToEdit.thumbnail_url || '',
          github_repo_url: projectToEdit.githubRepoUrl || projectToEdit.github_repo_url || '',
        });
      } else {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setTechnologies(parsed.technologies || []);
            delete parsed.technologies;
            reset(parsed);
            setHasDraft(true);
          } catch (e) {
            console.error('Failed to parse saved draft:', e);
          }
        } else {
          setSlugManuallyEdited(false);
          setHasDraft(false);
          setTechnologies([]);
          reset({
            name: '',
            slug: '',
            description: '',
            client_id: '',
            status: 'planning',
            priority: 'medium',
            start_date: '',
            deadline: '',
            completion_percent: 0,
            color: '#E11D48',
            thumbnail_url: '',
            github_repo_url: '',
          });
        }
      }
    }
  }, [isOpen, projectToEdit, reset]);

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setSlugManuallyEdited(false);
    setTechnologies([]);
    reset({
      name: '',
      slug: '',
      description: '',
      client_id: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      deadline: '',
      completion_percent: 0,
      color: '#E11D48',
      thumbnail_url: '',
      github_repo_url: '',
    });
  };

  const handleAttemptClose = useCallback(() => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Keyboard Shortcuts Listener (Ctrl+S, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleAttemptClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAttemptClose, handleSubmit]);

  const onSubmit = async (data: ProjectFormData) => {
    const { github_repo_url, ...sanitized } = sanitizeProjectData(data);
    const payload = {
      ...sanitized,
      technologies,
    };

    let targetProjectId = projectToEdit?.id;

    if (isEditing && projectToEdit?.id) {
      await updateMutation.mutateAsync({ id: projectToEdit.id, data: payload });
    } else {
      const created = await createMutation.mutateAsync(payload);
      targetProjectId = created?.id;
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
    }

    // Auto-connect/sync GitHub repository if URL provided
    if (github_repo_url && targetProjectId) {
      try {
        await syncGithubMutation.mutateAsync({
          projectId: targetProjectId,
          repoUrl: github_repo_url,
          force: true,
        });
      } catch (err) {
        console.error('Failed to sync attached GitHub repository:', err);
      }
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end font-mono select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleAttemptClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-zinc-100 text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white">
                  <HugeiconsIcon icon={Folder01Icon} size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-white">
                      {isEditing ? 'Edit Project Record' : 'Register New Project'}
                    </h2>
                    {hasDraft && !isEditing && (
                      <span className="px-2 py-0.5 rounded-sm bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold text-[10px]">
                        Draft Saved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isEditing ? 'Update project specifications & metadata.' : 'Define project specs, status, and timeline.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {hasDraft && !isEditing && (
                  <button
                    onClick={handleDiscardDraft}
                    title="Discard saved draft"
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </button>
                )}
                <button
                  onClick={handleAttemptClose}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form id="project-drawer-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Basic Information Section */}
              <div className="space-y-3 pb-3 border-b border-zinc-800/80">
                <h3 className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Basic Information</h3>
                
                <div>
                  <label className="block mb-1 font-bold text-zinc-200">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. AI Travel Assistant"
                    className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none focus:border-zinc-700"
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-rose-400">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-200">
                    Slug Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('slug')}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      register('slug').onChange(e);
                    }}
                    placeholder="ai-travel-assistant"
                    className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none focus:border-zinc-700 font-mono"
                  />
                  {errors.slug && <p className="mt-1 text-[11px] text-rose-400">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-200">Description</label>
                  <textarea
                    rows={3}
                    {...register('description')}
                    placeholder="Provide overview of scope and objectives..."
                    className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none focus:border-zinc-700 resize-none"
                  />
                </div>
              </div>

              {/* Classification & Progress Section */}
              <div className="space-y-3 pb-3 border-b border-zinc-800/80">
                <h3 className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Classification & Progress</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-zinc-200">Status</label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: 'planning', label: 'Planning' },
                            { value: 'active', label: 'Active' },
                            { value: 'on_hold', label: 'On Hold' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                          ]}
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-zinc-200">Priority</label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: 'low', label: 'Low Priority' },
                            { value: 'medium', label: 'Medium Priority' },
                            { value: 'high', label: 'High Priority' },
                            { value: 'urgent', label: 'Urgent' },
                          ]}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Completion Percentage Slider & Control */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-zinc-200">Completion Progress</label>
                    <span className="font-bold text-white text-xs">{watchCompletion || 0}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={watchCompletion || 0}
                      onChange={(e) => setValue('completion_percent', Number(e.target.value), { shouldValidate: true, shouldDirty: true })}
                      className="flex-1 h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={watchCompletion || 0}
                      onChange={(e) => setValue('completion_percent', Math.min(100, Math.max(0, Number(e.target.value))), { shouldValidate: true, shouldDirty: true })}
                      className="w-16 px-2 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-white font-mono text-center outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-zinc-200">Start Date</label>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Select start date"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-zinc-200">Deadline</label>
                    <Controller
                      name="deadline"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Select deadline"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Client, Tech Stack & Integrations Section */}
              <div className="space-y-3">
                <h3 className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Client & Integrations</h3>

                <div>
                  <label className="block mb-1 font-bold text-zinc-200">Assigned Client</label>
                  <Controller
                    name="client_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder={isLoadingClients ? 'Loading clients...' : 'Select Client...'}
                        options={[{ value: '', label: 'Unassigned / Internal Project' }, ...clientOptions]}
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Attached GitHub Repository */}
                <div>
                  <label className="block mb-1 font-bold text-zinc-200 flex items-center gap-1.5">
                    <HugeiconsIcon icon={GithubIcon} size={14} className="text-zinc-400" />
                    <span>Attach GitHub Repository URL</span>
                  </label>
                  <input
                    type="text"
                    {...register('github_repo_url')}
                    placeholder="https://github.com/owner/repository"
                    className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none focus:border-zinc-700 font-mono"
                  />
                </div>

                {/* Technology Stack Selector */}
                <div>
                  <label className="block mb-1 font-bold text-zinc-200 flex items-center gap-1.5">
                    <HugeiconsIcon icon={Tag01Icon} size={14} className="text-zinc-400" />
                    <span>Technology Stack</span>
                  </label>
                  <TechnologyPicker
                    value={technologies}
                    onChange={setTechnologies}
                    maxItems={20}
                  />
                </div>

                {/* Preset Color Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <HugeiconsIcon icon={PaintBucketIcon} size={14} className="text-zinc-400" />
                      <span>Project Accent Color</span>
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">{watchColor}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setValue('color', c.hex, { shouldValidate: true, shouldDirty: true })}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                          watchColor === c.hex
                            ? 'scale-125 border-white ring-2 ring-white/30'
                            : 'border-zinc-800 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </form>

            {/* Glass Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-zinc-500 hidden sm:inline">Ctrl+S to Save | Esc to Close</span>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="project-drawer-form"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <RadialSpinner size={14} />
                  ) : (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                  )}
                  <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Unsaved Changes Confirmation Modal */}
          {showUnsavedModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
              <div className="w-full max-w-sm p-5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                  <span>Discard Unsaved Changes?</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You have uncommitted edits in this form. Closing now will discard all unsaved changes.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowUnsavedModal(false)}
                    className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={() => {
                      setShowUnsavedModal(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-sm bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer shadow-sm"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectFormDrawer;
