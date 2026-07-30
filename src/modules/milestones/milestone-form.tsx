import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Flag01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Delete02Icon,
  Add01Icon,
  Attachment01Icon,
  Calendar01Icon,
  Clock01Icon,
  Doc01Icon,
  EyeIcon,
  GitBranchIcon,
  Loading03Icon,
  SparklesIcon,
  Tick02Icon
} from '@hugeicons/core-free-icons';

import { milestoneFormSchema, type MilestoneFormData } from '../../lib/validators/milestone-schema';
import { useCreateMilestone, useUpdateMilestone, useDeleteMilestone, useMilestones } from '../../lib/supabase/queries/milestones';
import { useProjects } from '../../lib/supabase/queries/projects';
import { ConfirmDeleteDialog } from '../../components/ui/confirm-delete-dialog';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { Badge } from '../../components/ui/badge';
import { Select, type SelectOption } from '../../../packages/ui/src/components/select';
import { DatePicker } from '../../../packages/ui/src/components/date-picker';
import type { Milestone } from '../../types';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

interface MilestoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneToEdit?: Milestone | null;
  projectId: string;
}

const MILESTONE_TEMPLATES = [
  {
    name: 'Project Kickoff & Architecture Discovery',
    description: '### Key Objectives\n- Define technical architecture & system boundaries\n- Finalize database schemas & RLS policies\n- Conduct kickoff call with client lead',
    priority: 'high',
    durationDays: 7,
    deliverables: [
      { id: 't1', name: 'Technical Architecture Document', status: 'pending' as const },
      { id: 't2', name: 'Database ER Diagram & Schema Spec', status: 'pending' as const },
    ],
  },
  {
    name: 'Backend API & Supabase Infrastructure',
    description: '### Key Objectives\n- Implement PostgREST RPC endpoints\n- Configure Row Level Security (RLS)\n- Set up automated migration pipelines',
    priority: 'urgent',
    durationDays: 14,
    deliverables: [
      { id: 't3', name: 'REST & GraphQL RPC Endpoints', status: 'pending' as const },
      { id: 't4', name: 'RLS Security Test Suite', status: 'pending' as const },
    ],
  },
  {
    name: 'Frontend UI Components & Design System',
    description: '### Key Objectives\n- Build reusable React UI components with TailwindCSS & Framer Motion\n- Ensure dark-first theme consistency and accessibility',
    priority: 'high',
    durationDays: 12,
    deliverables: [
      { id: 't5', name: 'Design System & Component Library', status: 'pending' as const },
      { id: 't6', name: 'Responsive Layout Wrappers', status: 'pending' as const },
    ],
  },
  {
    name: 'Client Portal & Integration Modules',
    description: '### Key Objectives\n- Deploy read-only Client Portal interface\n- Implement token validation and expiry rules',
    priority: 'high',
    durationDays: 10,
    deliverables: [
      { id: 't7', name: 'Client Portal Share Links Engine', status: 'pending' as const },
      { id: 't8', name: 'Payment Reminder & Unlock Center', status: 'pending' as const },
    ],
  },
  {
    name: 'End-to-End QA & Security Audit',
    description: '### Key Objectives\n- Execute full regression and security testing\n- Audit API endpoints and client permissions',
    priority: 'medium',
    durationDays: 7,
    deliverables: [
      { id: 't9', name: 'QA Test Results & Security Report', status: 'pending' as const },
    ],
  },
  {
    name: 'Production Deployment & Handoff',
    description: '### Key Objectives\n- Deploy production build to cloud infrastructure\n- Issue final deliverables and client handover documentation',
    priority: 'urgent',
    durationDays: 5,
    deliverables: [
      { id: 't10', name: 'Production Cloud Deployment', status: 'pending' as const },
      { id: 't11', name: 'Final Handover Documentation', status: 'pending' as const },
    ],
  },
];

export const MilestoneForm: React.FC<MilestoneFormProps> = ({
  isOpen,
  onClose,
  milestoneToEdit,
  projectId,
}) => {
  const isEditing = Boolean(milestoneToEdit);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch projects list for project selection
  const { data: projectsResult } = useProjects();
  const projectsList = React.useMemo(() => {
    const raw = (projectsResult as any)?.projects || (Array.isArray(projectsResult) ? projectsResult : []);
    return raw.map((p: any) => ({ value: String(p.id), label: p.name || 'Untitled Project' }));
  }, [projectsResult]);

  // Fetch existing milestones for dependency selection
  const { data: existingMilestones = [] } = useMilestones(projectId);

  // React Query Mutations
  const createMutation = useCreateMilestone();
  const updateMutation = useUpdateMilestone();
  const deleteMutation = useDeleteMilestone();

  const draftKey = `bunker_milestone_draft_${projectId}`;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema) as any,
    defaultValues: {
      project_id: projectId || '',
      name: '',
      description: '',
      status: 'in_progress',
      priority: 'medium',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      completion_date: '',
      is_client_visible: true,
      completion_rule: 'progress_100',
      deliverables: [],
      dependencies: [],
      attachments: [],
      owner_name: 'Project Team',
      version: 'v1.0',
      sprint: 'Sprint 1',
      labels: ['Release', 'Core'],
      sort_order: (existingMilestones.length || 0) + 1,
    },
  });

  const {
    fields: deliverableFields,
    append: appendDeliverable,
    remove: removeDeliverable,
  } = useFieldArray({
    control,
    name: 'deliverables',
  });

  const {
    fields: attachmentFields,
    append: appendAttachment,
    remove: removeAttachment,
  } = useFieldArray({
    control,
    name: 'attachments',
  });

  // Watch form values for live UI calculations
  const watchedName = watch('name');
  const watchedStatus = watch('status');
  const watchedProgress = watch('progress');
  const watchedDueDate = watch('due_date');
  const watchedStartDate = watch('start_date');
  const watchedCompletionDate = watch('completion_date');
  const watchedDescription = watch('description');
  const watchedClientVisible = watch('is_client_visible');
  const watchedDependencies = watch('dependencies') || [];

  // Reset form when opened or when milestoneToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (milestoneToEdit) {
        reset({
          id: milestoneToEdit.id,
          project_id: projectId,
          name: milestoneToEdit.name || milestoneToEdit.title || '',
          description: milestoneToEdit.description || milestoneToEdit.notes || '',
          status: (milestoneToEdit.status as any) || 'in_progress',
          priority: (milestoneToEdit.priority as any) || 'medium',
          progress: milestoneToEdit.progress || 0,
          start_date: milestoneToEdit.start_date || milestoneToEdit.startDate || '',
          due_date: milestoneToEdit.due_date || milestoneToEdit.dueDate || '',
          completion_date: milestoneToEdit.completion_date || milestoneToEdit.completionDate || '',
          is_client_visible: true,
          completion_rule: 'progress_100',
          deliverables: (milestoneToEdit.deliverables as any) || [],
          dependencies: (milestoneToEdit.dependencies as any[])?.map((d) => (typeof d === 'string' ? d : d.id)) || [],
          attachments: (milestoneToEdit.attachments as any) || [],
          owner_name: milestoneToEdit.owner_name || milestoneToEdit.ownerName || 'Project Team',
          version: milestoneToEdit.version || 'v1.0',
          sprint: milestoneToEdit.sprint || 'Sprint 1',
          labels: milestoneToEdit.labels || ['Release'],
          sort_order: milestoneToEdit.sort_order || 1,
        });
      } else {
        // Check for autosaved draft
        const savedDraft = sessionStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            reset(parsed);
          } catch (_e) {
            resetDefaultForm();
          }
        } else {
          resetDefaultForm();
        }
      }
    }
  }, [isOpen, milestoneToEdit, projectId, reset, draftKey]);

  const resetDefaultForm = () => {
    reset({
      name: '',
      description: '',
      status: 'in_progress',
      priority: 'medium',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      completion_date: '',
      is_client_visible: true,
      completion_rule: 'progress_100',
      deliverables: [
        { id: `del-1`, name: 'Technical Spec & Requirements', status: 'pending' },
        { id: `del-2`, name: 'Implementation & Verification', status: 'pending' },
      ],
      dependencies: [],
      attachments: [],
      owner_name: 'Project Team',
      version: 'v1.0',
      sprint: 'Sprint 1',
      labels: ['Release', 'Core'],
      sort_order: (existingMilestones.length || 0) + 1,
    });
  };

  // Auto-suggest completion date when status becomes 'completed'
  useEffect(() => {
    if (watchedStatus === 'completed' && !watchedCompletionDate) {
      setValue('completion_date', new Date().toISOString().split('T')[0]);
      setValue('progress', 100);
    }
  }, [watchedStatus, watchedCompletionDate, setValue]);

  // Save Draft to SessionStorage
  const handleSaveDraft = useCallback(() => {
    const values = watch();
    sessionStorage.setItem(draftKey, JSON.stringify(values));
    setToastMessage('Draft saved to session storage.');
    setTimeout(() => setToastMessage(null), 2500);
  }, [watch, draftKey]);

  // Unsaved Changes Guard
  const handleAttemptClose = () => {
    if (isDirty && !isSubmitting) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  // Fast Template Inserter
  const handleApplyTemplate = (tmpl: typeof MILESTONE_TEMPLATES[0]) => {
    setValue('name', tmpl.name, { shouldDirty: true });
    setValue('description', tmpl.description, { shouldDirty: true });
    setValue('priority', tmpl.priority as any, { shouldDirty: true });
    setValue('deliverables', tmpl.deliverables as any, { shouldDirty: true });

    const start = new Date();
    const due = new Date(start.getTime() + tmpl.durationDays * 86400000);
    setValue('start_date', start.toISOString().split('T')[0], { shouldDirty: true });
    setValue('due_date', due.toISOString().split('T')[0], { shouldDirty: true });
  };

  const watchedProjectId = watch('project_id');

  React.useEffect(() => {
    if (!watchedProjectId && (projectId || projectsList[0]?.value)) {
      setValue('project_id', projectId || projectsList[0]?.value);
    }
  }, [watchedProjectId, projectId, projectsList, setValue]);

  // Form Submit Handler
  const onSubmit = async (data: MilestoneFormData) => {
    try {
      const targetProjectId = data.project_id || projectId || (projectsList.length > 0 ? projectsList[0].value : '');

      if (!targetProjectId) {
        setErrorMessage('Please select a Target Project before saving the milestone.');
        return;
      }

      const milestonePayload: Partial<Milestone> = {
        ...data,
        project_id: targetProjectId,
        status: data.status as any,
        start_date: data.start_date || undefined,
        due_date: data.due_date || undefined,
        completion_date: data.completion_date || undefined,
      };

      if (isEditing && milestoneToEdit?.id) {
        await updateMutation.mutateAsync({
          id: milestoneToEdit.id,
          updates: milestonePayload,
        });
        sessionStorage.removeItem(draftKey);
        setToastMessage('Milestone updated successfully.');
      } else {
        await createMutation.mutateAsync(milestonePayload);
        sessionStorage.removeItem(draftKey);
        setToastMessage('Milestone created successfully.');
      }

      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(`Error saving milestone: ${err.message || 'Supabase mutation failed'}`);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!milestoneToEdit?.id) return;
    try {
      await deleteMutation.mutateAsync({ id: milestoneToEdit.id, projectId });
      setShowDeleteModal(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(`Error deleting milestone: ${err.message || 'Supabase deletion failed'}`);
    }
  };

  // Estimated Duration Calculation
  let durationDays = 0;
  if (watchedStartDate && watchedDueDate) {
    const start = new Date(watchedStartDate).getTime();
    const due = new Date(watchedDueDate).getTime();
    durationDays = Math.max(1, Math.ceil((due - start) / (1000 * 60 * 60 * 24)));
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Dark Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleAttemptClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Shell Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-4xl rounded-sm border border-zinc-800 bg-zinc-950 shadow-2xl backdrop-blur-2xl overflow-hidden font-mono text-xs select-none max-h-[92vh] flex flex-col"
        >
          {/* STICKY HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <HugeiconsIcon icon={Flag01Icon} size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {isEditing ? 'Edit Milestone Delivery Checkpoint' : 'Create New Project Milestone'}
                  </h2>
                  <Badge variant="outline" className="rounded-sm bg-zinc-900 text-cyan-400 border-cyan-800 text-[9px] uppercase font-bold">
                    {isEditing ? 'UPDATE MODE' : 'CREATE MODE'}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Define delivery checkpoints, deliverables, client visibility, and completion rules.
                </p>
              </div>
            </div>

            <button
              onClick={handleAttemptClose}
              className="w-8 h-8 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="mx-5 mt-3 p-3 rounded-sm bg-emerald-950/90 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* FORM BODY SCROLLABLE AREA */}
          <form id="milestone-form" onSubmit={handleSubmit(onSubmit as any)} className="overflow-y-auto p-5 space-y-6 custom-scrollbar flex-1">
            {/* FAST TEMPLATE INSERTION BAR (New Mode Only) */}
            {!isEditing && (
              <div className="p-3.5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={SparklesIcon} size={13} />
                  Fast Template Inserter (1-Click Fill)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {MILESTONE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-sm bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-700 text-[10px] font-bold text-zinc-300 hover:text-white cursor-pointer transition-all truncate max-w-[200px]"
                    >
                      + {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2-COLUMN FORM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Core Details & Markdown (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* SECTION 1: BASIC INFORMATION */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block border-b border-zinc-800/80 pb-2">
                    1. Basic Information
                  </span>

                  {/* Target Project Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase block">Target Project *</label>
                    <Controller
                      name="project_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || projectId}
                          onChange={(val) => field.onChange(val)}
                          options={
                            projectsList.length > 0
                              ? projectsList
                              : [{ value: projectId || 'default', label: 'Current Workspace Project' }]
                          }
                          className="w-full bg-zinc-950 border-zinc-800 text-xs text-white"
                        />
                      )}
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Milestone Name *</span>
                      <span className="font-mono text-zinc-500">{watchedName?.length || 0}/120</span>
                    </div>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Backend API & Core Architecture"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                    {errors.name && <p className="text-[10px] text-rose-400 font-sans">{errors.name.message}</p>}
                  </div>

                  {/* Status & Priority Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block">Status</label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            options={STATUS_OPTIONS}
                            className="w-full bg-zinc-950 border-zinc-800 text-xs text-white"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block">Priority</label>
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            options={PRIORITY_OPTIONS}
                            className="w-full bg-zinc-950 border-zinc-800 text-xs text-white"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Progress Percentage</span>
                      <strong className="text-cyan-400 font-mono text-xs">{watchedProgress}%</strong>
                    </div>
                    <Controller
                      name="progress"
                      control={control}
                      render={({ field }) => (
                        <div className="relative flex items-center w-full py-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-cyan-400 focus:outline-none"
                            style={{
                              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${field.value}%, #27272a ${field.value}%, #27272a 100%)`
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* SECTION 2: SCHEDULE & DATES */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                      2. Schedule & Delivery Dates
                    </span>
                    {durationDays > 0 && (
                      <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded-sm border border-cyan-800">
                        {durationDays} Days Duration
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar01Icon} size={11} />
                        Start Date
                      </label>
                      <Controller
                        name="start_date"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value || ''}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Select start date"
                            className="w-full bg-zinc-950 border-zinc-800 text-xs text-white"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center gap-1">
                        <HugeiconsIcon icon={Clock01Icon} size={11} />
                        Target Due Date *
                      </label>
                      <Controller
                        name="due_date"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value || ''}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Select due date"
                            className="w-full bg-zinc-950 border-zinc-800 text-xs text-white"
                          />
                        )}
                      />
                      {errors.due_date && <p className="text-[10px] text-rose-400 font-sans">{errors.due_date.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center gap-1">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                        Completion Date
                      </label>
                      <Controller
                        name="completion_date"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value || ''}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Select completion date"
                            className="w-full bg-zinc-950 border-zinc-800 text-xs text-white"
                          />
                        )}
                      />
                      {errors.completion_date && (
                        <p className="text-[10px] text-rose-400 font-sans">{errors.completion_date.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DESCRIPTION (MARKDOWN EDITOR) */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <HugeiconsIcon icon={Doc01Icon} size={14} className="text-cyan-400" />
                      3. Markdown Scope & Notes
                    </span>
                    <div className="flex items-center bg-zinc-950 p-0.5 rounded-sm border border-zinc-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                          activeTab === 'write' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                        }`}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                          activeTab === 'preview' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {activeTab === 'write' ? (
                    <textarea
                      {...register('description')}
                      rows={5}
                      placeholder="Enter detailed scope, acceptance criteria, markdown lists, tables, code blocks..."
                      className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                    />
                  ) : (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm min-h-[120px] font-sans text-xs text-zinc-300">
                      <MarkdownPreview content={watchedDescription || '_No description provided yet._'} compact />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Deliverables, Rules & Visibility (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* SECTION 4: DELIVERABLES CHECKLIST MANAGER */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-cyan-400" />
                      4. Deliverables Checklist ({deliverableFields.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => appendDeliverable({ id: `del-${Date.now()}`, name: '', status: 'pending' })}
                      className="px-2 py-0.5 rounded-sm bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={12} />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                    {deliverableFields.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 rounded-sm bg-zinc-950 border border-zinc-800">
                        <input
                          type="checkbox"
                          checked={watch(`deliverables.${idx}.status`) === 'completed'}
                          onChange={(e) =>
                            setValue(`deliverables.${idx}.status`, e.target.checked ? 'completed' : 'pending')
                          }
                          className="rounded-sm bg-zinc-900 border-zinc-700 text-cyan-400 cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register(`deliverables.${idx}.name`)}
                          placeholder="Deliverable item name..."
                          className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-850 rounded-sm text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => removeDeliverable(idx)}
                          className="p-1 rounded-sm text-zinc-500 hover:text-rose-400 cursor-pointer"
                          title="Remove item"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} />
                        </button>
                      </div>
                    ))}
                    {deliverableFields.length === 0 && (
                      <p className="text-[10px] text-zinc-500 font-sans text-center py-2">
                        No deliverables added yet. Click + Add to define checkpoints.
                      </p>
                    )}
                  </div>
                </div>

                {/* SECTION 5: ATTACHMENTS SELECTOR */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <HugeiconsIcon icon={Attachment01Icon} size={14} className="text-cyan-400" />
                      5. Project Attachments ({attachmentFields.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        appendAttachment({
                          id: `att-${Date.now()}`,
                          file_name: 'New_Asset.pdf',
                          file_url: '#',
                          file_size: '1.2 MB',
                        })
                      }
                      className="px-2 py-0.5 rounded-sm bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={12} />
                      <span>Attach Asset</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {attachmentFields.map((att, idx) => (
                      <div key={att.id} className="flex items-center justify-between p-2 rounded-sm bg-zinc-950 border border-zinc-850 text-[11px]">
                        <span className="text-zinc-200 font-bold truncate pr-2">{watch(`attachments.${idx}.file_name`)}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} />
                        </button>
                      </div>
                    ))}
                    {attachmentFields.length === 0 && (
                      <p className="text-[10px] text-zinc-500 font-sans text-center py-2">
                        No project files attached. Click + Attach Asset to link existing project files.
                      </p>
                    )}
                  </div>
                </div>

                {/* SECTION 6: CLIENT PORTAL VISIBILITY SWITCH */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <HugeiconsIcon icon={EyeIcon} size={14} className="text-cyan-400" />
                      6. Client Portal Visibility
                    </span>
                    <Controller
                      name="is_client_visible"
                      control={control}
                      render={({ field }) => (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    {watchedClientVisible
                      ? '✓ Milestone is visible to clients in the shared Client Portal.'
                      : '🔒 Hidden from Client Portal. Visible only to workspace admins.'}
                  </p>
                </div>

                {/* SECTION 7: COMPLETION RULES CARD */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block border-b border-zinc-800/80 pb-2">
                    7. Completion Automation Rule
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    <label className="flex items-center gap-2 p-2 rounded-sm bg-zinc-950 border border-zinc-850 cursor-pointer">
                      <input
                        type="radio"
                        value="progress_100"
                        {...register('completion_rule')}
                        className="text-cyan-400 bg-zinc-900 border-zinc-700 cursor-pointer"
                      />
                      <span className="text-zinc-300 font-sans">
                        Auto-complete when <strong>Progress reaches 100%</strong>
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-sm bg-zinc-950 border border-zinc-850 cursor-pointer">
                      <input
                        type="radio"
                        value="all_deliverables"
                        {...register('completion_rule')}
                        className="text-cyan-400 bg-zinc-900 border-zinc-700 cursor-pointer"
                      />
                      <span className="text-zinc-300 font-sans">
                        Auto-complete when <strong>Every deliverable is checked</strong>
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-sm bg-zinc-950 border border-zinc-850 cursor-pointer">
                      <input
                        type="radio"
                        value="manual"
                        {...register('completion_rule')}
                        className="text-cyan-400 bg-zinc-900 border-zinc-700 cursor-pointer"
                      />
                      <span className="text-zinc-300 font-sans">
                        <strong>Manual completion only</strong>
                      </span>
                    </label>
                  </div>
                </div>

                {/* SECTION 8: DEPENDENCIES MULTI-SELECT */}
                <div className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
                    <HugeiconsIcon icon={GitBranchIcon} size={14} className="text-cyan-400" />
                    8. Milestone Dependencies
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {existingMilestones
                      .filter((m) => m.id !== milestoneToEdit?.id)
                      .map((m) => {
                        const isChecked = watchedDependencies.includes(m.id);
                        return (
                          <label key={m.id} className="flex items-center justify-between p-1.5 rounded-sm bg-zinc-950 border border-zinc-850 cursor-pointer text-[11px]">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setValue('dependencies', [...watchedDependencies, m.id], { shouldDirty: true });
                                  } else {
                                    setValue(
                                      'dependencies',
                                      watchedDependencies.filter((id) => id !== m.id),
                                      { shouldDirty: true }
                                    );
                                  }
                                }}
                                className="rounded-sm bg-zinc-900 border-zinc-700 text-cyan-400 cursor-pointer"
                              />
                              <span className="text-zinc-300 font-bold truncate">{m.name || m.title}</span>
                            </div>
                            <span className="text-[9px] text-zinc-500 font-mono shrink-0">{m.status}</span>
                          </label>
                        );
                      })}
                    {existingMilestones.length === 0 && (
                      <p className="text-[10px] text-zinc-500 font-sans text-center py-1">
                        No other milestones available for dependency chaining.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* STICKY FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/90 shrink-0">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 rounded-sm bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                  <span>Delete Milestone</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={Tick02Icon} size={14} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleAttemptClose}
                className="px-3.5 py-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="milestone-form"
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2 rounded-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin text-zinc-950" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                    <span>{isEditing ? 'Save Changes' : 'Create Milestone'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-sm bg-zinc-950 border border-zinc-800 space-y-4 font-mono text-xs select-none">
            <div className="flex items-center gap-2 text-amber-400">
              <HugeiconsIcon icon={AlertCircleIcon} size={20} />
              <strong className="text-sm font-bold text-white">Unsaved Changes</strong>
            </div>
            <p className="text-zinc-400 font-sans">
              You have unsaved changes in this milestone form. Do you want to save draft before closing?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  handleSaveDraft();
                  setShowUnsavedModal(false);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-sm bg-cyan-600 text-zinc-950 font-bold text-xs"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Milestone Checkpoint"
        description={`Are you sure you want to delete "${milestoneToEdit?.name || milestoneToEdit?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Error Alert Dialog */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-sm bg-zinc-950 border border-rose-800/80 space-y-4 font-mono text-xs select-none shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <HugeiconsIcon icon={AlertCircleIcon} size={20} />
              <strong className="text-sm font-bold text-white">Milestone Mutation Error</strong>
            </div>
            <p className="text-zinc-300 font-sans leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex items-center justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-4 py-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer border border-zinc-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneForm;
