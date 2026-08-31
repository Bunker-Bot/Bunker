import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  useTask,
  useUpdateTask,
  useTaskAttachments,
  useUploadTaskAttachment,
  useDeleteTaskAttachment
} from '../../lib/supabase/queries/tasks';
import { useProjects } from '../../lib/supabase/queries/projects';
import { Select } from '../../../packages/ui/src/components/select';
import { DatePicker } from '../../../packages/ui/src/components/date-picker';
import { MarkdownToolbar } from '../projects/components/MarkdownToolbar';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../../packages/ui/src/components/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Task01Icon,
  Tag01Icon,
  Folder01Icon,
  AttachmentIcon,
  Delete02Icon,
  Download01Icon,
  Edit01Icon,
  EyeIcon,
  PlusSignIcon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';

interface TaskDetailDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Zod Validation Schema
const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
  project_id: z.string().min(1, 'Project selection is required'),
  description: z.string().optional().nullable(),
  module: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'review', 'testing', 'completed']),
  progress: z.number().min(0).max(100),
  due_date: z.string().optional().nullable(),
  labels: z.array(z.string()),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const PRIORITY_OPTIONS = [
  { label: 'Low Priority', value: 'low' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'High Priority', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const STATUS_OPTIONS = [
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Testing', value: 'testing' },
  { label: 'Completed', value: 'completed' },
];

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 1. Fetch Task Details (Progressively loaded)
  const { data: task, isLoading: isLoadingTask } = useTask(taskId);

  // 2. Fetch Attachments (Lazily loaded)
  const { data: attachments = [], isLoading: isLoadingAttachments } = useTaskAttachments(taskId);

  // 3. Projects List
  const { data: projectsResult } = useProjects({ limit: 100 });
  const projects = (projectsResult as any)?.projects || [];

  const projectOptions = useMemo(() => {
    return projects.map((p: any) => ({
      value: p.id,
      label: p.name || 'Untitled Project',
    }));
  }, [projects]);

  // Mutations
  const updateTaskMutation = useUpdateTask();
  const uploadAttachmentMutation = useUploadTaskAttachment();
  const deleteAttachmentMutation = useDeleteTaskAttachment();

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      project_id: '',
      description: '',
      module: '',
      priority: 'medium',
      status: 'todo',
      progress: 0,
      due_date: '',
      labels: [],
    },
  });

  const descriptionValue = watch('description') || '';
  const currentLabels = watch('labels') || [];
  const currentStatus = watch('status');

  // Sync form values when task loads
  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        project_id: task.project_id || '',
        description: task.description || '',
        module: task.module || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        progress: task.progress ?? 0,
        due_date: task.due_date || '',
        labels: task.labels || [],
      });
    }
  }, [task, reset]);

  // Handle Markdown Insertion
  const handleInsertMarkdown = (prefix: string, suffix = '') => {
    setValue('description', `${descriptionValue}\n${prefix}${suffix}`, { shouldDirty: true });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(descriptionValue);
  };

  // Add Label Tag
  const handleAddLabel = () => {
    const trimmed = newLabelInput.trim().toLowerCase();
    if (trimmed && !currentLabels.includes(trimmed)) {
      setValue('labels', [...currentLabels, trimmed], { shouldDirty: true });
      setNewLabelInput('');
    }
  };

  // Remove Label Tag
  const handleRemoveLabel = (labelToRemove: string) => {
    setValue('labels', currentLabels.filter((l) => l !== labelToRemove), { shouldDirty: true });
  };

  // Upload File Attachment
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !taskId) return;

    setUploadError('');
    setIsUploadingFile(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 25 * 1024 * 1024) {
          setUploadError(`File ${file.name} exceeds 25MB limit.`);
          continue;
        }
        await uploadAttachmentMutation.mutateAsync({ taskId, file });
      }
    } catch (err: any) {
      setUploadError(err.message || 'Attachment upload failed.');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  // Handle Delete Attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (taskId && window.confirm('Delete this file attachment?')) {
      await deleteAttachmentMutation.mutateAsync({ id: attachmentId, taskId });
    }
  };

  // Submit Handler
  const onSubmit = async (values: TaskFormValues) => {
    if (!taskId) return;

    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates: {
        ...values,
        description: values.description ? values.description.trim() : null,
        module: values.module ? values.module.trim() : null,
        due_date: values.due_date ? values.due_date : null,
        progress: values.status === 'completed' ? 100 : values.progress,
      },
    });

    onClose();
  };

  // Warn on Unsaved Close
  const handleAttemptClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes in this task. Are you sure you want to discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 overflow-hidden font-mono select-none">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleAttemptClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Slide-over Right Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-3xl bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl relative"
          >
            {/* 1. Glass Header */}
            <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white shrink-0">
                  <HugeiconsIcon icon={Task01Icon} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Task Workspace</span>
                    {currentStatus && (
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 border-zinc-700 text-zinc-300">
                        {currentStatus.replace('_', ' ')}
                      </Badge>
                    )}
                    {isDirty && (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">
                    {task?.title || 'Task Specifications'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="p-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>
            </div>

            {/* 2. Main Content Body */}
            {isLoadingTask ? (
              <div className="flex-1 p-6 space-y-6">
                <Skeleton className="h-8 w-3/4 bg-zinc-900" />
                <Skeleton className="h-24 w-full bg-zinc-900" />
                <Skeleton className="h-40 w-full bg-zinc-900" />
              </div>
            ) : (
              <form id="task-drawer-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Task Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="Enter clear, actionable task title..."
                    className="w-full px-3.5 py-2.5 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 font-mono text-sm outline-none focus:border-zinc-700 transition-colors font-bold"
                  />
                  {errors.title && (
                    <span className="text-[11px] text-rose-400 flex items-center gap-1 font-mono">
                      <HugeiconsIcon icon={AlertCircleIcon} size={12} />
                      {errors.title.message}
                    </span>
                  )}
                </div>

                {/* Metadata Classification Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded bg-zinc-900/60 border border-zinc-800/80">
                  {/* Project */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                      <HugeiconsIcon icon={Folder01Icon} size={12} />
                      Target Project
                    </label>
                    <Controller
                      name="project_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={projectOptions}
                          className="w-full text-xs"
                        />
                      )}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Status</label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            if (val === 'completed') setValue('progress', 100, { shouldDirty: true });
                          }}
                          options={STATUS_OPTIONS}
                          className="w-full text-xs"
                        />
                      )}
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Priority</label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={PRIORITY_OPTIONS}
                          className="w-full text-xs"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Module & Due Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded bg-zinc-900/60 border border-zinc-800/80">
                  {/* Module Tag */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                      <HugeiconsIcon icon={Tag01Icon} size={12} />
                      Module / Scope
                    </label>
                    <input
                      type="text"
                      {...register('module')}
                      placeholder="e.g. Authentication, Billing, Dashboard..."
                      className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 font-mono text-xs outline-none focus:border-zinc-700"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Due Date</label>
                    <Controller
                      name="due_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Select due date..."
                          className="w-full text-xs"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Progress Slider Section */}
                <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Completion Progress</span>
                    <span className="font-bold text-white font-mono">{watch('progress')}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={watch('progress')}
                      onChange={(e) => setValue('progress', Number(e.target.value), { shouldDirty: true })}
                      className="w-full accent-cyan-400 h-1.5 bg-zinc-950 rounded-sm appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={watch('progress')}
                      onChange={(e) => setValue('progress', Math.min(100, Math.max(0, Number(e.target.value))), { shouldDirty: true })}
                      className="w-16 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-white font-mono text-xs text-center outline-none"
                    />
                  </div>
                </div>

                {/* Markdown Description Workspace */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Technical Description & Specs (Markdown)
                    </label>

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setActiveTab('editor')}
                        className={`px-2.5 py-1 rounded cursor-pointer font-bold flex items-center gap-1.5 transition-colors ${activeTab === 'editor' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                          }`}
                      >
                        <HugeiconsIcon icon={Edit01Icon} size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-2.5 py-1 rounded cursor-pointer font-bold flex items-center gap-1.5 transition-colors ${activeTab === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                          }`}
                      >
                        <HugeiconsIcon icon={EyeIcon} size={12} />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>

                  {activeTab === 'editor' ? (
                    <div className="space-y-2">
                      <MarkdownToolbar
                        onInsert={handleInsertMarkdown}
                        onCopy={handleCopyMarkdown}
                        viewMode={activeTab === 'editor' ? 'edit' : 'preview'}
                        onViewModeChange={(mode) => setActiveTab(mode === 'preview' ? 'preview' : 'editor')}
                      />
                      <textarea
                        {...register('description')}
                        rows={8}
                        placeholder="Write comprehensive task specifications, setup steps, or acceptance criteria in Markdown..."
                        className="w-full p-3 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 font-mono text-xs outline-none focus:border-zinc-700 leading-relaxed resize-y"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded bg-zinc-900 border border-zinc-800 min-h-[200px]">
                      {descriptionValue ? (
                        <MarkdownPreview content={descriptionValue} />
                      ) : (
                        <p className="text-zinc-500 text-xs italic">No description provided yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Labels Combobox */}
                <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Task Labels</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newLabelInput}
                      onChange={(e) => setNewLabelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLabel();
                        }
                      }}
                      placeholder="Add label tag (e.g. api, bug, feature)..."
                      className="flex-1 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 font-mono text-xs outline-none focus:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={handleAddLabel}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={14} />
                    </button>
                  </div>

                  {currentLabels.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {currentLabels.map((lbl, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                          <span>#{lbl}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLabel(lbl)}
                            className="text-zinc-500 hover:text-rose-400 cursor-pointer ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachments Section (Lazy Loaded) */}
                <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <HugeiconsIcon icon={AttachmentIcon} size={14} />
                      <span>Task File Attachments</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {attachments.length}
                      </Badge>
                    </span>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer">
                      <HugeiconsIcon icon={PlusSignIcon} size={14} />
                      <span>Upload File</span>
                      <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {uploadError && (
                    <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 font-mono">
                      <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {isUploadingFile && (
                    <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                      <RadialSpinner size={16} />
                      <span>Uploading attachment to storage...</span>
                    </div>
                  )}

                  {isLoadingAttachments ? (
                    <Skeleton className="h-16 w-full bg-zinc-900" />
                  ) : attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <HugeiconsIcon icon={AttachmentIcon} size={14} className="text-zinc-500 shrink-0" />
                            <span className="font-bold text-white truncate max-w-xs">{att.file_name}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={att.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                              title="Download attachment"
                            >
                              <HugeiconsIcon icon={Download01Icon} size={14} />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
                              title="Delete attachment"
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-xs italic">No file attachments uploaded for this task yet.</p>
                  )}
                </div>
              </form>
            )}

            {/* 3. Glass Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0 z-20">
              <div className="text-[11px] text-zinc-500 font-mono">
                {task?.updated_at && `Last updated: ${new Date(task.updated_at).toLocaleString()}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="task-drawer-form"
                  disabled={updateTaskMutation.isPending || !isDirty}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded font-bold text-xs shadow-sm transition-all cursor-pointer ${isDirty
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    }`}
                >
                  {updateTaskMutation.isPending ? (
                    <>
                      <RadialSpinner size={14} />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                      <span>Save Specification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailDrawer;
