import React, { useState, useMemo } from 'react';
import { useCreateGuardianAvatar } from '../data/avatar.queries';
import { useProjects } from '../../../lib/supabase/queries/projects';
import { generateAvatarConfig } from '../lib/avatar-generator';
import { AvatarPoster } from '../components/AvatarPoster';
import { Select } from '../../../../packages/ui/src/components/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Cancel01Icon,
  Folder01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

interface AvatarCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (createdId: string) => void;
}

export const AvatarCreateModal: React.FC<AvatarCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const createMutation = useCreateGuardianAvatar();
  const { data: projectsResult } = useProjects({ limit: 100 });

  const [name, setName] = useState('New Guardian');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const previewConfig = React.useMemo(() => {
    return generateAvatarConfig({
      entityId: selectedProjectId || `new-${Date.now()}`,
      entityKind: 'project',
      name: name || 'New Guardian',
    });
  }, [name, selectedProjectId]);

  const rawProjects = (projectsResult as any)?.projects || (Array.isArray(projectsResult) ? projectsResult : []);

  const projectOptions = useMemo(() => {
    return [
      { value: '', label: 'Unassigned (Keep in Library)' },
      ...rawProjects.map((p: any) => ({
        value: p.id,
        label: `${p.name} (${p.clientName || 'Direct'})`,
      })),
    ];
  }, [rawProjects]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        config: previewConfig,
        projectId: selectedProjectId || null,
      });
      onCreated(created.id);
      onClose();
    } catch (err) {
      console.error('Failed to create guardian avatar:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-xs">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-sm p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-cyan-400" />
            <span>Generate Guardian Identity</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Live Preview Card */}
          <div className="p-3.5 rounded-sm bg-zinc-900/80 border border-zinc-800 flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-sm bg-zinc-950 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
              <AvatarPoster config={previewConfig} size="100%" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400">10-Digit ID Generated</span>
              <p className="font-bold text-white text-xs truncate">{name || 'Guardian'}</p>
              <p className="text-[10px] text-zinc-400 capitalize">
                {previewConfig.material} • {previewConfig.archetype}
              </p>
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Guardian Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Commerce Guardian, Sentinel Alpha"
              className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-cyan-400"
            />
          </div>

          {/* Project Assignment dropdown using shadcn Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
              <HugeiconsIcon icon={Folder01Icon} size={13} className="text-cyan-400" />
              <span>Assign to Project (Optional)</span>
            </label>
            <Select
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={projectOptions}
              placeholder="Unassigned (Keep in Library)"
              className="w-full"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <HugeiconsIcon icon={Tick01Icon} size={14} />
              <span>{createMutation.isPending ? 'Generating...' : 'Generate Guardian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
