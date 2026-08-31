import React from 'react';
import { AvatarLibraryCard } from './AvatarLibraryCard';
import { AvatarPoster } from '../components/AvatarPoster';
import { AvatarCode } from '../components/AvatarCode';
import type { GuardianAvatarDTO, AvatarStudioViewMode } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
} from '@hugeicons/core-free-icons';

interface AvatarLibraryProps {
  avatars: GuardianAvatarDTO[];
  selectedAvatarId: string | null;
  viewMode: AvatarStudioViewMode;
  isLoading: boolean;
  onSelect: (avatar: GuardianAvatarDTO) => void;
  onOpenAssign: (avatar: GuardianAvatarDTO) => void;
  onOpenRegenerate: (avatar: GuardianAvatarDTO) => void;
  onDuplicate: (avatar: GuardianAvatarDTO) => void;
  onReset: (avatar: GuardianAvatarDTO) => void;
  onDelete: (avatar: GuardianAvatarDTO) => void;
  onOpenCreate: () => void;
}

export const AvatarLibrary: React.FC<AvatarLibraryProps> = ({
  avatars,
  selectedAvatarId,
  viewMode,
  isLoading,
  onSelect,
  onOpenAssign,
  onOpenRegenerate,
  onDuplicate,
  onReset,
  onDelete,
  onOpenCreate,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 font-mono select-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-sm bg-zinc-900/60 border border-zinc-800 animate-pulse p-4 space-y-3">
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="w-full aspect-square bg-zinc-800/80 rounded-sm" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-sm bg-zinc-950 border border-zinc-800 text-center space-y-4 font-mono select-none">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
          <HugeiconsIcon icon={SparklesIcon} size={28} />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-white">Guardian Library Ready</h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            No avatars matched your search filters. Create new Guardian identities to customize and assign to projects.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow inline-flex items-center gap-1.5"
        >
          <HugeiconsIcon icon={SparklesIcon} size={14} />
          <span>Generate New Identity</span>
        </button>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="rounded-sm border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs shadow-md select-none">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <tr>
                <th className="px-4 py-3">Guardian</th>
                <th className="px-4 py-3">Guardian ID</th>
                <th className="px-4 py-3">Project Assignment</th>
                <th className="px-4 py-3">Material & Archetype</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {avatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                return (
                  <tr
                    key={avatar.id}
                    onClick={() => onSelect(avatar)}
                    className={`hover:bg-zinc-900/60 transition-colors cursor-pointer ${isSelected ? 'bg-cyan-950/20 text-white font-bold' : ''
                      }`}
                  >
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                        <AvatarPoster config={avatar.config} size="100%" />
                      </div>
                      <span className="truncate max-w-[140px]">{avatar.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <AvatarCode code={avatar.avatarCode} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      {avatar.isAssigned ? (
                        <span className="text-cyan-300 font-bold truncate max-w-[140px] block">
                          {avatar.projectName}
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-sans">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-400">
                      {avatar.config.material} • {avatar.config.archetype}
                    </td>
                    <td className="px-4 py-3">
                      {avatar.isAssigned ? (
                        <span className="text-emerald-400 font-bold text-[10.5px]">Assigned</span>
                      ) : (
                        <span className="text-zinc-500 text-[10.5px]">Available</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(avatar);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-[10.5px] cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 font-mono select-none">
      {avatars.map((avatar) => (
        <AvatarLibraryCard
          key={avatar.id}
          avatar={avatar}
          isSelected={selectedAvatarId === avatar.id}
          onSelect={onSelect}
          onOpenAssign={onOpenAssign}
          onOpenRegenerate={onOpenRegenerate}
          onDuplicate={onDuplicate}
          onReset={onReset}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AvatarLibrary;
