import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTask, useUpdateTask } from '../../lib/supabase/queries/tasks';
import { useProjects } from '../../lib/supabase/queries/projects';
import type { TaskItem, TaskPriority, TaskStatus } from '../../lib/repositories/task.repository';
import { Select } from '../../../packages/ui/src/components/select';
import { DatePicker } from '../../../packages/ui/src/components/date-picker';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Task01Icon,
  Folder01Icon,
  Tag01Icon,
  Calendar01Icon,
  Flag01Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons';

interface TaskFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskItem | null;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

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

export const TaskFormDrawer: React.FC<TaskFormDrawerProps> = ({
  isOpen,
  onClose,
  taskToEdit = null,
  defaultProjectId = '',
  defaultStatus = 'todo',
}) => {
  const { data: projectsResult } = useProjects({ limit: 100 });
  const projects = (projectsResult as any)?.projects || [];

  const projectOptions = React.useMemo(() => {
    return projects.map((p: any) => ({
      value: p.id,
      label: p.name || 'Untitled Project',
    }));
  }, [projects]);

  const [projectId, setProjectId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [module, setModule] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [progress, setProgress] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [labelsInput, setLabelsInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  useEffect(() => {
    if (taskToEdit) {
      setProjectId(taskToEdit.project_id || '');
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setModule(taskToEdit.module || '');
      setPriority(taskToEdit.priority || 'medium');
      setStatus(taskToEdit.status || 'todo');
      setProgress(taskToEdit.progress ?? 0);
      setDueDate(taskToEdit.due_date || '');
      setLabelsInput(taskToEdit.labels ? taskToEdit.labels.join(', ') : '');
    } else {
      setProjectId(defaultProjectId || (projects[0]?.id || ''));
      setTitle('');
      setDescription('');
      setModule('');
      setPriority('medium');
      setStatus(defaultStatus);
      setProgress(defaultStatus === 'completed' ? 100 : 0);
      setDueDate('');
      setLabelsInput('');
    }
    setFormError('');
  }, [taskToEdit, isOpen, defaultProjectId, defaultStatus, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required.');
      return;
    }
    if (!projectId) {
      setFormError('Please select a project for this task.');
      return;
    }

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      if (taskToEdit) {
        await updateTaskMutation.mutateAsync({
          id: taskToEdit.id,
          updates: {
            project_id: projectId,
            title: title.trim(),
            description: description.trim() || null,
            module: module.trim() || null,
            priority,
            status,
            progress,
            due_date: dueDate || null,
            labels,
          },
        });
      } else {
        await createTaskMutation.mutateAsync({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || null,
          module: module.trim() || null,
          priority,
          status,
          progress,
          due_date: dueDate || null,
          labels,
        });
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the task.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm font-mono select-none">
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl text-zinc-100"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                <HugeiconsIcon icon={Task01Icon} size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {taskToEdit ? 'Edit Task Specification' : 'Create Internal Task'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {taskToEdit ? 'Update details, priority, or status' : 'Add a development task to execution board'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Drawer Body Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
            {formError && (
              <div className="p-3 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono">
                {formError}
              </div>
            )}

            {/* Task Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span>Task Title</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement OAuth JWT Authentication Handler"
                className="w-full px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 outline-none focus:border-zinc-700"
                required
              />
            </div>

            {/* Target Project Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <HugeiconsIcon icon={Folder01Icon} size={13} className="text-zinc-500" />
                <span>Project</span>
                <span className="text-rose-400">*</span>
              </label>
              <Select
                value={projectId}
                onChange={setProjectId}
                options={projectOptions}
                placeholder="Select target project..."
                className="w-full"
              />
            </div>

            {/* Module Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <HugeiconsIcon icon={Tag01Icon} size={13} className="text-zinc-500" />
                <span>Module / Feature Area</span>
              </label>
              <input
                type="text"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="e.g. Authentication, Billing, API, UI"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 outline-none focus:border-zinc-700"
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Flag01Icon} size={13} className="text-zinc-500" />
                  <span>Status</span>
                </label>
                <Select
                  value={status}
                  onChange={(val) => setStatus(val as TaskStatus)}
                  options={STATUS_OPTIONS}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Clock01Icon} size={13} className="text-zinc-500" />
                  <span>Priority</span>
                </label>
                <Select
                  value={priority}
                  onChange={(val) => setPriority(val as TaskPriority)}
                  options={PRIORITY_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2 p-3 rounded bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300">Completion Progress</span>
                <span className="font-mono text-white font-bold">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-zinc-500" />
                <span>Due Date</span>
              </label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Select target completion date..."
              />
            </div>

            {/* Labels Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Labels <span className="text-zinc-500 font-normal">(Comma separated)</span>
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="e.g. API, Frontend, Urgent, v1.2"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 outline-none focus:border-zinc-700"
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Description & Acceptance Criteria</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe execution steps, implementation specs, dependencies..."
                rows={4}
                className="w-full p-3 rounded bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 outline-none focus:border-zinc-700 resize-none font-mono"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RadialSpinner size={14} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                    <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
