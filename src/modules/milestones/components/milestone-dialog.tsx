import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Flag01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Select } from '../../../../packages/ui/src/components/select';
import type { Milestone } from '../../../types';

interface MilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestoneData: Partial<Milestone>) => void;
  milestone?: Milestone | null;
  projectId: string;
}

export const MilestoneDialog: React.FC<MilestoneDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  milestone,
  projectId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Milestone['status']>('in_progress');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [ownerName, setOwnerName] = useState('Project Team');
  const [version, setVersion] = useState('');
  const [sprint, setSprint] = useState('');
  const [labelsInput, setLabelsInput] = useState('');

  useEffect(() => {
    if (milestone) {
      setName(milestone.name || milestone.title || '');
      setDescription(milestone.description || milestone.notes || '');
      setStatus(milestone.status || 'in_progress');
      setPriority(milestone.priority || 'medium');
      setProgress(milestone.progress || 0);
      setStartDate(milestone.start_date || milestone.startDate || '');
      setDueDate(milestone.due_date || milestone.dueDate || '');
      setOwnerName(milestone.owner_name || milestone.ownerName || 'Project Team');
      setVersion(milestone.version || '');
      setSprint(milestone.sprint || '');
      setLabelsInput((milestone.labels || []).join(', '));
    } else {
      setName('');
      setDescription('');
      setStatus('in_progress');
      setPriority('medium');
      setProgress(0);
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setOwnerName('Project Team');
      setVersion('v1.0');
      setSprint('Sprint 1');
      setLabelsInput('Release, Core');
    }
  }, [milestone, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedLabels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    onSave({
      id: milestone?.id,
      project_id: projectId,
      name: name.trim(),
      description: description.trim(),
      status: progress >= 100 ? 'completed' : status,
      priority,
      progress: Number(progress),
      start_date: startDate || undefined,
      due_date: dueDate || undefined,
      owner_name: ownerName.trim(),
      version: version.trim(),
      sprint: sprint.trim(),
      labels: parsedLabels,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative z-10 w-full max-w-lg rounded-sm border border-zinc-800 bg-zinc-950 p-6 shadow-2xl backdrop-blur-2xl font-mono text-xs select-none space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-sm bg-cyan-950 text-cyan-400 border border-cyan-800">
                <HugeiconsIcon icon={Flag01Icon} size={16} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {milestone ? 'Edit Delivery Milestone' : 'Create New Milestone'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-sm hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">Milestone Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Backend API & Core Architecture"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
                required
              />
            </div>

            {/* Description Markdown */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">
                Description / Scope (Markdown Supported)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Details, key deliverables, acceptance criteria..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Priority</label>
                <Select
                  value={priority}
                  onChange={(val) => setPriority(val as any)}
                  options={[
                    { value: 'low', label: 'Low Priority' },
                    { value: 'medium', label: 'Medium Priority' },
                    { value: 'high', label: 'High Priority' },
                    { value: 'urgent', label: 'Urgent Priority' },
                  ]}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Status</label>
                <Select
                  value={status}
                  onChange={(val) => setStatus(val as any)}
                  options={[
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'overdue', label: 'Overdue' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
                <span>Progress Completion %</span>
                <span className="text-cyan-400 font-mono font-bold text-xs">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer bg-zinc-800 h-2 rounded-sm"
              />
            </div>

            {/* Start & Due Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Owner & Release Info */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Owner</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block">Sprint</label>
                <input
                  type="text"
                  value={sprint}
                  onChange={(e) => setSprint(e.target.value)}
                  placeholder="Sprint 1"
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white"
                />
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">
                Labels (Comma-separated)
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="Release, Core, API, Security"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white font-sans"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                <span>Save Milestone</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MilestoneDialog;
