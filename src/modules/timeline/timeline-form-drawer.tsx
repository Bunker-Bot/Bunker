import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTimelineUpdate, useUpdateTimelineUpdate } from '../../lib/supabase/queries/timeline';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Calendar01Icon,
  PlusSignIcon,
  Delete02Icon,
  Link01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';

export interface TimelineFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  updateToEdit?: any | null;
}

interface FormData {
  title: string;
  entry_date: string;
  description: string;
}

export const TimelineFormDrawer: React.FC<TimelineFormDrawerProps> = ({
  isOpen,
  onClose,
  projectId,
  updateToEdit = null,
}) => {
  const isEditing = Boolean(updateToEdit);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [newAttachName, setNewAttachName] = useState('');
  const [newAttachUrl, setNewAttachUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateTimelineUpdate();
  const updateMutation = useUpdateTimelineUpdate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      entry_date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  useEffect(() => {
    if (updateToEdit) {
      reset({
        title: updateToEdit.title || '',
        entry_date: updateToEdit.entry_date || new Date().toISOString().split('T')[0],
        description: updateToEdit.description || '',
      });
      setAttachments(updateToEdit.attachments || []);
    } else {
      reset({
        title: '',
        entry_date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setAttachments([]);
    }
    setFormError(null);
  }, [updateToEdit, isOpen, reset]);

  const handleAddAttachment = () => {
    if (!newAttachUrl.trim()) return;
    const name = newAttachName.trim() || newAttachUrl.split('/').pop() || 'Attachment';
    setAttachments([...attachments, { name, url: newAttachUrl.trim() }]);
    setNewAttachName('');
    setNewAttachUrl('');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
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
            attachments,
          },
        });
      } else {
        await createMutation.mutateAsync({
          project_id: projectId,
          title: data.title,
          entry_date: data.entry_date,
          description: data.description,
          attachments,
        });
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save update entry.');
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs font-mono select-none flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white">
                <HugeiconsIcon icon={Calendar01Icon} size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {isEditing ? 'Edit Project Update' : 'New Timeline Update'}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  {isEditing ? 'Update chronological project update log.' : 'Publish a new entry to the project timeline.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-5 space-y-4 overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-sm bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Update Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Update title is required.' })}
                  placeholder="e.g. Completed responsive landing page"
                  className="w-full px-3 py-2 rounded-sm bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
                />
                {errors.title && (
                  <p className="text-[10px] text-rose-400">{errors.title.message}</p>
                )}
              </div>

              {/* Entry Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Entry Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  {...register('entry_date', { required: 'Entry date is required.' })}
                  className="w-full px-3 py-2 rounded-sm bg-zinc-950 border border-zinc-800 text-white text-xs outline-none focus:border-zinc-700"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Description & Context (Markdown Supported)
                </label>
                <textarea
                  rows={6}
                  {...register('description')}
                  placeholder="Provide detailed context, feature specs, bug fixes, or milestone highlights..."
                  className="w-full px-3 py-2 rounded-sm bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700 resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Attachments & Resources
                </label>

                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newAttachName}
                      onChange={(e) => setNewAttachName(e.target.value)}
                      placeholder="Label (e.g. Design.png)"
                      className="px-2.5 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white text-xs outline-none placeholder-zinc-500"
                    />
                    <input
                      type="url"
                      value={newAttachUrl}
                      onChange={(e) => setNewAttachUrl(e.target.value)}
                      placeholder="Resource URL (https://...)"
                      className="px-2.5 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white text-xs outline-none placeholder-zinc-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    disabled={!newAttachUrl.trim()}
                    className="w-full py-1.5 rounded-sm bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs hover:bg-zinc-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={14} />
                    <span>Attach Resource Link</span>
                  </button>
                </div>

                {/* Attachment list */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {attachments.map((att, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-sm bg-zinc-950 border border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <HugeiconsIcon icon={Link01Icon} size={13} className="text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-200 truncate">{att.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-sm bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
              >
                {isPending ? <RadialSpinner size={14} /> : <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />}
                <span>{isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Update'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TimelineFormDrawer;
