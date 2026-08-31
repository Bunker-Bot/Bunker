import React, { useState } from 'react';
import { useProjects } from '../../../lib/supabase/queries/projects';
import { useAssignGuardianAvatar, useUnassignGuardianAvatar } from '../data/avatar.queries';
import { AvatarPoster } from '../components/AvatarPoster';
import { AvatarCode } from '../components/AvatarCode';
import type { GuardianAvatarDTO } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Search01Icon,
  Link01Icon,
  Cancel01Icon,
  AlertCircleIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

interface AvatarAssignmentModalProps {
  avatar: GuardianAvatarDTO;
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarAssignmentModal: React.FC<AvatarAssignmentModalProps> = ({
  avatar,
  isOpen,
  onClose,
}) => {
  const { data: projectsResult, isLoading } = useProjects({ limit: 100 });
  const assignMutation = useAssignGuardianAvatar();
  const unassignMutation = useUnassignGuardianAvatar();

  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(avatar.projectId || null);

  React.useEffect(() => {
    if (avatar) {
      setSelectedProjectId(avatar.projectId || null);
    }
  }, [avatar?.id, avatar?.projectId, isOpen]);

  if (!isOpen) return null;

  const rawProjects = (projectsResult as any)?.projects || (Array.isArray(projectsResult) ? projectsResult : []);

  const filteredProjects = rawProjects.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase())) ||
    (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = async () => {
    if (!selectedProjectId) return;
    try {
      await assignMutation.mutateAsync({
        avatarId: avatar.id,
        projectId: selectedProjectId,
      });
      onClose();
    } catch (err) {
      console.error('Failed to assign avatar:', err);
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignMutation.mutateAsync({
        avatarId: avatar.id,
        currentProjectId: avatar.projectId,
      });
      setSelectedProjectId(null);
      onClose();
    } catch (err) {
      console.error('Failed to unassign avatar:', err);
    }
  };

  const currentAssignedProject = rawProjects.find((p: any) => p.id === avatar.projectId);
  const targetProject = rawProjects.find((p: any) => p.id === selectedProjectId);
  const isReplacing = selectedProjectId && avatar.projectId && selectedProjectId !== avatar.projectId;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-xs">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-sm p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HugeiconsIcon icon={Link01Icon} size={16} className="text-cyan-400" />
            <span>Assign Guardian Identity</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* Selected Guardian Info Banner */}
        <div className="p-3 rounded-sm bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
            <AvatarPoster config={avatar.config} size="100%" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs truncate">{avatar.name}</h4>
              <AvatarCode code={avatar.avatarCode} size="xs" />
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              {avatar.isAssigned
                ? `Currently assigned to: ${currentAssignedProject?.name || avatar.projectName || 'Project'}`
                : 'Currently unassigned (available for any project)'}
            </p>
          </div>
        </div>

        {/* Project Search Input */}
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, client, slug..."
            className="w-full pl-9 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-cyan-400"
          />
        </div>

        {/* Projects List */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
          {isLoading ? (
            <div className="p-4 text-center text-zinc-500 animate-pulse">Loading projects catalog...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">No matching projects found.</div>
          ) : (
            filteredProjects.map((proj: any) => {
              const isSelected = selectedProjectId === proj.id;
              const isCurrent = avatar.projectId === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`w-full p-3 rounded-sm border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 shrink-0">
                      <HugeiconsIcon icon={Folder01Icon} size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate text-white">{proj.name}</p>
                      <div className="text-[10px] text-zinc-400 font-sans flex items-center gap-1.5">
                        <span className="truncate">{proj.clientName || 'Direct Project'}</span>
                        <span>•</span>
                        <span className="capitalize">{proj.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[9.5px] uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Current
                      </span>
                    )}
                    {isSelected && (
                      <HugeiconsIcon icon={Tick01Icon} size={16} className="text-cyan-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Replacement Warning */}
        {isReplacing && targetProject && (
          <div className="p-3 rounded-sm bg-amber-950/40 border border-amber-800/80 flex items-start gap-2.5 text-[11px] text-amber-200">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p>
              Reassigning will move <strong>#{avatar.avatarCode}</strong> to <strong>{targetProject.name}</strong>. The project's public portal and future social share previews will immediately use this identity.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
          {avatar.isAssigned ? (
            <button
              type="button"
              onClick={handleUnassign}
              disabled={unassignMutation.isPending}
              className="px-3 py-2 rounded-sm bg-rose-950/40 border border-rose-800/80 hover:bg-rose-900 text-rose-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {unassignMutation.isPending ? 'Unassigning...' : 'Remove Assignment'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedProjectId || selectedProjectId === avatar.projectId || assignMutation.isPending}
              className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow"
            >
              {assignMutation.isPending ? 'Assigning...' : isReplacing ? 'Replace & Assign' : 'Assign to Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
